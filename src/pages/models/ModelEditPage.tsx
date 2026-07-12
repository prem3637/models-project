import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetModelDetailsQuery } from '../../redux/services/models';
import ModelForm from './components/ModelForm';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import envConfig from '../../config';
import { useAppSelector } from '../../redux/hooks';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/errorHelper';
import { ProfilePictureUploader } from './components/ProfilePictureUploader';

export const ModelEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: modelRes, isLoading, error, refetch } = useGetModelDetailsQuery(id || '');
  const model = modelRes?.data;
  const token = useAppSelector((state) => state.auth.token);

  // Profile preview modal State
  const [viewProfileOpen, setViewProfileOpen] = useState(false);



  // SSE video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'starting' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file size exceeds the 50MB limit.');
      return;
    }

    setVideoFile(file);
    setUploadStatus('uploading');
    setProgress(0);
    setErrorMessage('');

    try {
      // 1. Perform multipart upload to API 1
      const formData = new FormData();
      formData.append('video', file);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const uploadRes = await fetch(`${envConfig.api_url}/models/${id}/video/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        signal: abortController.signal
      });

      if (!uploadRes.ok) {
        const errJson = await uploadRes.json().catch(() => ({}));
        throw new Error(getErrorMessage(errJson, 'Upload request failed'));
      }

      const { jobId } = await uploadRes.json();
      setUploadStatus('processing');

      // 2. Open SSE listener to track background processing
      const sseUrl = `${envConfig.api_url}/models/video/status/${jobId}`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setUploadStatus(data.status);

          if (data.progress !== undefined) {
            setProgress(data.progress);
          }

          if (data.status === 'completed') {
            es.close();
            refetch();
          } else if (data.status === 'failed') {
            setErrorMessage(data.error || 'Upload failed');
            es.close();
          }
        } catch (err) {
          console.error('Failed to parse SSE data', err);
        }
      };

      es.onerror = () => {
        setUploadStatus('failed');
        setErrorMessage('Connection to status server lost');
        es.close();
      };

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setUploadStatus('failed');
        setErrorMessage('Upload cancelled by user');
      } else {
        setUploadStatus('failed');
        setErrorMessage(err.message || 'Upload process failed');
      }
      if (eventSourceRef.current) eventSourceRef.current.close();
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setUploadStatus('idle');
    setVideoFile(null);
    setProgress(0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 w-full">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center w-full">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-150">Model Profile Not Found</h2>
        <button
          onClick={() => navigate('/models')}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
        >
          Back to Models List
        </button>
      </div>
    );
  }

  const primaryImageUrl = model?.profilePicture?.url || '';

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 w-full">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate(`/models/${model.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-505 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer w-fit focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile Details
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Model Profile Details</h1>
          <p className="text-xs text-slate-505">Update talent attributes, category, and portfolio for {model.basicDeatils?.fullName}.</p>
        </div>
      </div>

      {/* Profile Header Composite Card (Same as details view page) */}
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 dark:from-navy-card dark:via-navy-950/10 dark:to-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-center gap-6 shadow-sm relative transition-all duration-200">
        <ProfilePictureUploader
          modelId={model.id}
          fullName={model.basicDeatils?.fullName}
          profilePictureUrl={primaryImageUrl}
          editable={true}
        />

        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">{model.basicDeatils?.fullName}</h2>
            </div>

            {/* Email, Phone, and Base Location tags */}
            <div className="flex items-center gap-3.5 flex-wrap text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mt-1">
              <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-navy-950/40 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-navy-border/20">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{model.basicDeatils?.email}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-navy-950/40 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-navy-border/20">
                <svg className="w-3.5 h-3.5 text-slate-405 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{model.basicDeatils?.primartContact ? `${model.basicDeatils.primartContact.code} ${model.basicDeatils.primartContact.number}` : ''}</span>
              </div>

              {model.address?.country && (
                <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-navy-950/40 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-navy-border/20">
                  <svg className="w-3.5 h-3.5 text-slate-405 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{[model.address.city?.name, model.address.state?.name, model.address.country?.name].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
            {model.bio && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 italic line-clamp-2 max-w-xl">
                "{model.bio}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mt-1">
            <div className="flex flex-col items-center justify-center p-3 bg-white/70 dark:bg-navy-card/50 border border-slate-150 dark:border-navy-border/40 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                </svg>
                <span className="text-[9px] font-bold text-slate-400  tracking-wider">Age</span>
              </div>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{model.basicDeatils?.age} yrs</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-white/70 dark:bg-navy-card/50 border border-slate-150 dark:border-navy-border/40 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4h8M8 12h6M8 8h4M8 16h8M8 20h8M4 4v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                </svg>
                <span className="text-[9px] font-bold text-slate-400  tracking-wider">Height</span>
              </div>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{model.measurements?.height}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-white/70 dark:bg-navy-card/50 border border-slate-150 dark:border-navy-border/40 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span className="text-[9px] font-bold text-slate-400  tracking-wider">Weight</span>
              </div>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">{model.measurements?.weight ? `${model.measurements.weight} kg` : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Main Form */}
        <div className="md:col-span-2 bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm">
          <ModelForm modelId={model.id} initialValues={model} onSuccess={() => navigate(`/models/${model.id}`)} />
        </div>

        {/* Right 1 Column: SSE Video Uploader */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4 transition-all duration-200">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 flex items-center justify-center border border-accent-100 dark:border-accent-900/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white  tracking-wider">Introduction</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Talent presentation video file</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-navy-950/50 p-3 rounded-xl border border-slate-100 dark:border-navy-border/40">
              Provide a high-quality pitch or composite presentation reel (supported formats: MP4, WebM; max size: 50MB).
            </p>

            {model.introVideo ? (
              <div className="flex flex-col gap-2">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-navy-border shadow-md">
                  <video src={model.introVideo.url} controls className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-505 text-center truncate italic font-medium px-2 mt-1">
                  Active file: {model.introVideo.path?.split('/').pop() || 'pitch.mp4'}
                </span>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl bg-slate-50 dark:bg-navy-950/20 border border-dashed border-slate-300 dark:border-navy-border/70 flex flex-col items-center justify-center text-center p-4">
                <div className="p-2.5 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-400 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold  tracking-wide">No video introduction added</span>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-navy-border/50 pt-4 flex flex-col gap-3">
              {uploadStatus === 'idle' && (
                <label className="w-full">
                  <span className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 active:bg-accent-800 text-white rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors shadow-sm select-none gap-1.5 focus:outline-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Video
                  </span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                </label>
              )}

              {uploadStatus !== 'idle' && uploadStatus !== 'completed' && uploadStatus !== 'failed' && (
                <div className="flex flex-col gap-3 bg-slate-50 dark:bg-navy-950/30 p-3 border dark:border-navy-border/50 rounded-xl">
                  {videoFile && (
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 truncate block">
                      FILE: {videoFile.name}
                    </span>
                  )}
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-505 dark:text-slate-400  tracking-wide">
                    <span className="capitalize text-accent-600 dark:text-accent-400">
                      {uploadStatus === 'starting' ? 'Preparing...' : uploadStatus === 'uploading' ? 'Uploading...' : 'Processing...'}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-navy-950 h-2 rounded-full overflow-hidden border dark:border-navy-border shadow-inner">
                    <div
                      className="bg-accent-600 h-full transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <Button type="button" variant="secondary" size="sm" className="w-full mt-1" onClick={handleCancelUpload}>
                    Cancel Upload
                  </Button>
                </div>
              )}

              {uploadStatus === 'completed' && (
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/35 text-[10px] font-extrabold  tracking-wide">
                  ✔ Video upload complete!
                </div>
              )}

              {uploadStatus === 'failed' && (
                <div className="flex flex-col gap-3.5">
                  <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-755 dark:text-red-400 border border-red-200 dark:border-red-800/35 text-[10px] font-extrabold  tracking-wide">
                    ❌ {errorMessage || 'Upload failed.'}
                  </div>
                  <label className="w-full">
                    <span className="w-full py-2.5 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors border dark:border-navy-border shadow-sm">
                      Retry Upload
                    </span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Profile Photo Preview Lightbox */}
      {viewProfileOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 cursor-default" onClick={() => setViewProfileOpen(false)} />
          <button
            onClick={() => setViewProfileOpen(false)}
            className="absolute top-6 right-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors z-10 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative z-10 flex flex-col items-center gap-3">
            <img
              src={primaryImageUrl}
              alt="Profile Preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800/40"
            />
            <span className="text-xs font-semibold text-slate-400">{model.basicDeatils?.fullName} - Profile Photo</span>
          </div>
        </div>
      )}


    </div>
  );
};

export default ModelEditPage;
