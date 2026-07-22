import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../../../redux/hooks';
import toast from 'react-hot-toast';
import envConfig from '../../../config';
import { formatFileSize, downloadFile, getCleanFileName, createClientThumbnailUrl } from '../../../utils/helperfunction';
import { useRemoveModelFileMutation } from '../../../redux/services/models';
import { useConfirmDelete } from '../../../utils/useConfirmDelete';

interface UploadJobState {
  id: string; // local unique id
  file: File;
  previewUrl: string;
  status: 'idle' | 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  errorMessage?: string;
}

interface MultiImageUploaderProps {
  modelId: string;
  existingImages?: any[];
  onSuccess: () => void;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ modelId, existingImages, onSuccess }) => {
  const token = useAppSelector((state) => state.auth.token);
  const [removeModelFile] = useRemoveModelFileMutation();
  const { confirmDelete: confirmImageDelete } = useConfirmDelete<any>(async (item) => {
    try {
      await removeModelFile({ id: modelId, fileId: item.id }).unwrap();
      onSuccess();
    } catch (err) {
      toast.error('Failed to delete image');
    }
  });

  const [jobs, setJobs] = useState<UploadJobState[]>([]);
  const [uploadingAll, setUploadingAll] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const handlePreview = (url: string, title: string) => {
    setPreviewLoaded(false);
    setActivePreviewImage({ url, title });
  };

  const jobsRef = useRef<UploadJobState[]>([]);
  jobsRef.current = jobs;

  const abortControllerRef = useRef<AbortController | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const revokeJobUrls = (jobsToRevoke: UploadJobState[]) => {
    jobsToRevoke.forEach((job) => {
      try {
        URL.revokeObjectURL(job.previewUrl);
      } catch (e) {}
    });
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (abortControllerRef.current) abortControllerRef.current.abort();
      revokeJobUrls(jobsRef.current);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = Array.from(e.target.files);

    const validFiles = fileList.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file.`);
        return false;
      }
      if (file.size > 30 * 1024 * 1024) {
        toast.error(`"${file.name}" size exceeds the 30MB limit.`);
        return false;
      }
      return true;
    });

    const newJobsPromises = validFiles.map(async (file) => {
      const jobId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      const previewUrl = await createClientThumbnailUrl(file);
      return {
        id: jobId,
        file,
        previewUrl,
        status: 'idle' as const,
        progress: 0,
      };
    });

    const newJobs = await Promise.all(newJobsPromises);
    setJobs((prev) => [...prev, ...newJobs]);
  };

  const handleCancelJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    if (job.status === 'uploading' || job.status === 'processing') {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (eventSourceRef.current) eventSourceRef.current.close();
      revokeJobUrls(jobs);
      setJobs([]);
      setUploadingAll(false);
      return;
    }

    try { URL.revokeObjectURL(job.previewUrl); } catch (e) {}
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const startBulkUpload = async () => {
    const pendingJobs = jobs.filter((j) => j.status === 'idle' || j.status === 'failed');
    if (pendingJobs.length === 0) return;

    setUploadingAll(true);

    setJobs((prev) =>
      prev.map((j) => {
        const jobIdx = pendingJobs.findIndex((pj) => pj.id === j.id);
        if (jobIdx === 0) {
          return { ...j, status: 'uploading', progress: 0 };
        } else if (jobIdx > 0) {
          return { ...j, status: 'queued', progress: 0 };
        }
        return j;
      })
    );

    const formData = new FormData();
    pendingJobs.forEach((job) => {
      formData.append('images', job.file);
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setJobs((prev) =>
          prev.map((j) => {
            const jobIdx = pendingJobs.findIndex((pj) => pj.id === j.id);
            if (jobIdx === 0) {
              return { ...j, status: 'uploading', progress: Math.round(percentComplete * 0.9) };
            }
            return j;
          })
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let responseData;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (e) {}

        const jobId = responseData?.jobId;
        if (!jobId) {
          toast.error('Bulk upload started, but failed to receive progress tracking ID');
          setUploadingAll(false);
          return;
        }

        const sseUrl = `${envConfig.api_url}/models/images/status/${jobId}`;
        const es = new EventSource(sseUrl);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const sseStatus = data.status;
            const sseProgress = data.progress ?? 0;

            if (sseStatus === 'processing' || sseStatus === 'completed') {
              const N = pendingJobs.length;
              setJobs((prev) =>
                prev.map((j) => {
                  const jobIdx = pendingJobs.findIndex((pj) => pj.id === j.id);
                  if (jobIdx === -1) return j;

                  const fileQuota = 100 / N;
                  const completedFilesCount = Math.floor(sseProgress / fileQuota);

                  if (jobIdx < completedFilesCount) {
                    return { ...j, status: 'completed', progress: 100 };
                  } else if (jobIdx === completedFilesCount) {
                    const currentFileProgress = Math.min(
                      Math.round(((sseProgress % fileQuota) / fileQuota) * 100),
                      100
                    );
                    return {
                      ...j,
                      status: sseStatus === 'completed' ? 'completed' : 'processing',
                      progress: currentFileProgress,
                    };
                  } else {
                    return { ...j, status: 'queued', progress: 0 };
                  }
                })
              );

              if (sseStatus === 'completed') {
                es.close();
                toast.success('All images uploaded successfully');
                onSuccess();
                setTimeout(() => {
                  revokeJobUrls(pendingJobs);
                  setJobs([]);
                  setUploadingAll(false);
                }, 1200);
              }
            } else if (sseStatus === 'failed') {
              es.close();
              const errMsg = data.error || 'Server processing failed';
              toast.error(errMsg);
              setJobs((prev) =>
                prev.map((j) =>
                  pendingJobs.some((pj) => pj.id === j.id)
                    ? { ...j, status: 'failed', errorMessage: errMsg }
                    : j
                )
              );
              setUploadingAll(false);
            }
          } catch (err) {
            console.error('Failed to parse SSE data', err);
          }
        };

        es.onerror = () => {
          es.close();
          toast.error('Status stream connection lost');
          setJobs((prev) =>
            prev.map((j) =>
              pendingJobs.some((pj) => pj.id === j.id)
                ? { ...j, status: 'failed', errorMessage: 'Status connection lost' }
                : j
            )
          );
          setUploadingAll(false);
        };
      } else {
        let errorMessage = 'Upload failed';
        try {
          const errJson = JSON.parse(xhr.responseText);
          errorMessage = errJson.message || errorMessage;
        } catch (e) {}

        toast.error(errorMessage);
        setJobs((prev) =>
          prev.map((j) =>
            pendingJobs.some((pj) => pj.id === j.id)
              ? { ...j, status: 'failed', errorMessage }
              : j
          )
        );
        setUploadingAll(false);
      }
    };

    xhr.onerror = () => {
      toast.error('Network error during upload');
      setJobs((prev) =>
        prev.map((j) =>
          pendingJobs.some((pj) => pj.id === j.id)
            ? { ...j, status: 'failed', errorMessage: 'Network error occurred' }
            : j
        )
      );
      setUploadingAll(false);
    };

    xhr.onabort = () => {
      toast.error('Upload cancelled');
      setJobs((prev) =>
        prev.map((j) =>
          pendingJobs.some((pj) => pj.id === j.id)
            ? { ...j, status: 'failed', errorMessage: 'Upload cancelled' }
            : j
        )
      );
      setUploadingAll(false);
    };

    xhr.open('POST', `${envConfig.api_url}/models/${modelId}/images/bulk-upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    abortController.signal.addEventListener('abort', () => {
      xhr.abort();
    });

    xhr.send(formData);
  };

  return (
    <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4 transition-all duration-200">
      {/* Title block */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-border pb-3">
        <div className="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 flex items-center justify-center border border-accent-100 dark:border-accent-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex flex-col text-left">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wider">Portfolio Gallery</h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-550">Upload multiple talent portfolio images</span>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div className="flex flex-col items-center">
        <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-navy-border hover:border-accent-500/60 dark:hover:border-accent-500/60 hover:bg-slate-50/40 dark:hover:bg-[#0c101d]/10 rounded-xl p-8 cursor-pointer transition-all duration-200">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="p-3 bg-slate-50 dark:bg-navy-950/40 text-slate-400 dark:text-slate-550 rounded-xl border dark:border-navy-border">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to select or drag & drop portfolio images</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">PNG, JPG, or JPEG (Max 30MB per file)</span>
            </div>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Scrollable list containing pending and existing images */}
      {((existingImages && existingImages.length > 0) || jobs.length > 0) && (
        <div className="flex flex-col gap-2.5 mt-2 text-left">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 tracking-wider">
            Uploaded Photos ({((existingImages?.length || 0) + jobs.length)})
          </span>
          
          <div className="flex flex-col border border-slate-200 dark:border-navy-border rounded-xl divide-y divide-slate-100 dark:divide-navy-border/50 overflow-y-auto max-h-[350px] bg-slate-50/25 dark:bg-navy-950/10">
            
            {/* Pending & Uploading files (rendered at the top of the list) */}
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-navy-card/30 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Thumbnail with overlay progress */}
                  <div className="w-11 h-11 rounded-xl border border-slate-200 dark:border-navy-border relative overflow-hidden shrink-0 shadow-sm">
                    <img
                      src={job.previewUrl}
                      alt={job.file.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Progress overlay */}
                    {job.status === 'idle' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="text-[8px] text-white font-extrabold tracking-wide bg-slate-800/60 px-1 py-0.5 rounded">
                          New
                        </span>
                      </div>
                    )}

                    {job.status === 'queued' && (
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                        <span className="text-[8px] text-white font-extrabold tracking-wide bg-slate-700/60 px-1 py-0.5 rounded">
                          Queued
                        </span>
                      </div>
                    )}

                    {(job.status === 'uploading' || job.status === 'processing') && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <svg className="w-8 h-8 transform -rotate-90">
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            className="stroke-white/20"
                            strokeWidth="2"
                            fill="transparent"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            className="stroke-white transition-all duration-200 ease-out"
                            strokeWidth="2"
                            fill="transparent"
                            strokeDasharray={75.4}
                            strokeDashoffset={75.4 - (job.progress / 100) * 75.4}
                          />
                        </svg>
                      </div>
                    )}

                    {job.status === 'failed' && (
                      <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[300px]">
                      {job.file.name}
                    </span>
                    <span className="text-[9px] text-slate-405 dark:text-slate-505 font-bold tracking-wider">
                      {formatFileSize(job.file.size)} • {
                        job.status === 'idle' ? 'Ready to upload' :
                        job.status === 'queued' ? 'Queued' :
                        job.status === 'completed' ? 'Completed' :
                        job.status === 'failed' ? `Failed: ${job.errorMessage || 'Error'}` :
                        `${job.status === 'uploading' ? 'Uploading' : 'Processing'} (${job.progress}%)`
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === 'idle' && (
                    <button
                      type="button"
                      onClick={() => handleCancelJob(job.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={startBulkUpload}
                        className="text-[10px] font-extrabold text-accent-500 hover:text-accent-600 px-2.5 py-1.5 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-950/20 tracking-wider cursor-pointer"
                      >
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelJob(job.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}            {/* Existing Uploaded Images */}
            {existingImages && existingImages.map((img) => {
              const cleanTitle = img.originalName || getCleanFileName(img.path || img.url);
              return (
                <div key={img.id} className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-navy-card/30 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={img.thumbnailUrl || img.url}
                      alt={cleanTitle}
                      className="w-11 h-11 object-cover rounded-xl border border-slate-200 dark:border-navy-border cursor-pointer hover:opacity-90 transition-all shadow-sm shrink-0"
                      onClick={() => handlePreview(img.url, cleanTitle)}
                      title="Click to preview image"
                    />
                    <div className="flex flex-col text-left min-w-0">
                      <span
                        onClick={() => handlePreview(img.url, cleanTitle)}
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-accent-500 dark:hover:text-accent-400 cursor-pointer transition-colors truncate"
                      >
                        {cleanTitle}
                      </span>
                      <span className="text-[9px] text-slate-405 dark:text-slate-505 font-bold tracking-wider">
                        {img.size ? formatFileSize(img.size) : 'Cloud Asset'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreview(img.url, cleanTitle)}
                      className="text-[10px] font-extrabold text-accent-500 hover:text-accent-600 transition-colors px-2 py-1 rounded-lg hover:bg-accent-55 dark:hover:bg-accent-950/20 tracking-wider cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(img.url, cleanTitle)}
                      className="text-[10px] font-extrabold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 tracking-wider cursor-pointer"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmImageDelete({ id: img.id }, cleanTitle)}
                      className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Action buttons for bulk upload */}
          {jobs.some((j) => j.status === 'idle' || j.status === 'failed') && (
            <div className="w-full mt-1 pb-1">
              <button
                type="button"
                onClick={startBulkUpload}
                disabled={uploadingAll}
                className="w-full text-xs text-white bg-accent-600 hover:bg-accent-700 font-extrabold py-2.5 px-5 rounded-xl disabled:opacity-50 shadow-sm border border-accent-700/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {uploadingAll ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {activePreviewImage && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 cursor-default" onClick={() => setActivePreviewImage(null)} />

          <button
            type="button"
            onClick={() => setActivePreviewImage(null)}
            className="absolute top-6 right-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors z-10 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col items-center gap-3 w-full max-w-4xl relative z-10">
            <div className="relative w-full flex items-center justify-center min-h-[40vh]">
              {!previewLoaded && (
                <div className="relative flex items-center justify-center w-full max-h-[75vh] h-[65vh] overflow-hidden rounded-lg shadow-2xl border border-slate-800/40">
                  <img
                    src={activePreviewImage.url}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover filter blur-sm brightness-90 scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                    <svg className="animate-spin h-8 w-8 text-accent-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-[10px] font-bold text-slate-300 mt-2.5 tracking-widest uppercase">Loading image...</span>
                  </div>
                </div>
              )}
              <img
                key={activePreviewImage.url}
                src={activePreviewImage.url}
                alt={activePreviewImage.title}
                onLoad={() => setPreviewLoaded(true)}
                className={`max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl border border-slate-800/40 ${
                  previewLoaded ? 'block' : 'hidden'
                }`}
              />
            </div>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-3 mt-1.5">
              <span>{activePreviewImage.title}</span>
              <span className="text-slate-700 font-normal">|</span>
              <button
                type="button"
                onClick={() => downloadFile(activePreviewImage.url, activePreviewImage.title)}
                className="inline-flex items-center gap-1.5 text-accent-400 hover:text-accent-300 text-xs font-bold transition-colors cursor-pointer focus:outline-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Download Image
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
