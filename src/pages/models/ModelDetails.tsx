import React, { useState, useEffect } from 'react';
import { formatDate } from '../../utils/helperfunction';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetModelDetailsQuery, useDeleteModelMutation } from '../../redux/services/models';
import { useAppAbility } from '../../context/AbilityContext';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { useConfirmDelete } from '../../utils/useConfirmDelete';
import ShareModelModal from './components/ShareModelModal';

export const ModelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ability = useAppAbility();

  const { data: modelRes, isLoading, error } = useGetModelDetailsQuery(id || '');
  const model = modelRes?.data;

  const [deleteModel, { isLoading: isDeleting }] = useDeleteModelMutation();
  const { confirmDelete } = useConfirmDelete<any>(async (item) => {
    await deleteModel(item.id).unwrap();
    navigate('/models');
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Helper to extract clean filename
  const getCleanFileName = (path: string) => {
    if (!path) return 'Portfolio Asset';
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/^\d+-\d+-/, '').replace(/^\d+-/, '');
  };

  // File size formatter
  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Gallery view mode: 'grid' | 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Lightbox State
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null || !model?.images) return;
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((activeImageIndex + 1) % model.images.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((activeImageIndex - 1 + model.images.length) % model.images.length);
      } else if (e.key === 'Escape') {
        setActiveImageIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, model]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            <Skeleton className="w-24 h-24 rounded-full shrink-0" />
            <div className="flex flex-col items-center md:items-start gap-2.5 w-full md:w-48">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800">Model Not Found</h2>
        <p className="text-xs text-slate-500 max-w-xs">The talent profile you are trying to view does not exist or has been deleted.</p>
        <Link to="/models">
          <Button variant="secondary" size="sm">Back to Models</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (model) {
      confirmDelete({ id: model.id }, `${model.basicDeatils?.fullName}'s profile`);
    }
  };

  const primaryImageUrl = model.images?.[0]?.url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop';

  const formattedPrimaryContact = model.basicDeatils?.primartContact
    ? `${model.basicDeatils.primartContact.code} ${model.basicDeatils.primartContact.number}`
    : 'N/A';

  const formattedSecondaryContact = model.basicDeatils?.secondryContact?.number
    ? `${model.basicDeatils.secondryContact.code} ${model.basicDeatils.secondryContact.number}`
    : null;

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200 w-full">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/models"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-505 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors  tracking-wider"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Models List
        </Link>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsShareModalOpen(true)}
            variant="secondary"
            size="sm"
            className="dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.57 2.286M13.254 9.972l-4.57 2.286M15 13a3 3 0 11-6 0 3 3 0 016 0zm6-6a3 3 0 11-6 0 3 3 0 016 0zM6 18a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            Share Profile
          </Button>
          {ability.can('update', 'models') && (
            <Button
              onClick={() => navigate(`/models/${model.id}/edit`)}
              variant="secondary"
              size="sm"
              className="dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
            >
              Edit Profile
            </Button>
          )}
          {ability.can('delete', 'models') && (
            <Button
              onClick={handleDelete}
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            >
              Delete Profile
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Info Card */}
          <div className="bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 dark:from-navy-card dark:via-navy-950/10 dark:to-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm relative transition-all duration-200">
            <div className="relative shrink-0">
              <div
                onClick={() => {
                  if (model?.images && model.images.length > 0) {
                    setActiveImageIndex(0);
                  }
                }}
                className="w-32 h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-navy-border shadow-md ring-4 ring-slate-100/80 dark:ring-navy-900/50 relative group cursor-pointer"
              >
                <img
                  src={primaryImageUrl}
                  alt={model.basicDeatils?.fullName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Hover overlay for profile view */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-center gap-1.5 p-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-[9px] font-bold  tracking-wider">View Photo</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {model.basicDeatils?.fullName}
                  </h2>
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
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{formattedPrimaryContact}</span>
                  </div>

                  {model.address?.country && (
                    <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-navy-950/40 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-navy-border/20">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{[model.address.city?.name, model.address.state?.name, model.address.country?.name].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
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
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                    {model.basicDeatils?.age} yrs
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-white/70 dark:bg-navy-card/50 border border-slate-150 dark:border-navy-border/40 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4h8M8 12h6M8 8h4M8 16h8M8 20h8M4 4v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                    </svg>
                    <span className="text-[9px] font-bold text-slate-400  tracking-wider">Height</span>
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                    {model.measurements?.height}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-white/70 dark:bg-navy-card/50 border border-slate-150 dark:border-navy-border/40 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <span className="text-[9px] font-bold text-slate-400  tracking-wider">Weight</span>
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                    {model.measurements?.weight ? `${model.measurements.weight} kg` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Introduction Card */}
          {model.introVideo && (
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-200">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-navy-border/50 pb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 flex items-center justify-center border border-accent-100 dark:border-accent-900/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wider">Video Introduction</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Talent overview presentation reel</span>
                </div>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-navy-border shadow-lg group relative">
                <video
                  src={model.introVideo.url}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Portfolio Images Gallery */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-5 transition-colors duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-border pb-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wider">Model Portfolio</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Studio books and snapshots ({model.images?.length || 0} images)</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-950 p-1 rounded-lg border border-slate-200 dark:border-navy-border">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'grid'
                      ? 'bg-white dark:bg-navy-card text-accent-600 dark:text-accent-400 shadow-sm border border-slate-200/50 dark:border-navy-border/50'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth={2} />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth={2} />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth={2} />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth={2} />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'list'
                      ? 'bg-white dark:bg-navy-card text-accent-600 dark:text-accent-400 shadow-sm border border-slate-200/50 dark:border-navy-border/50'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <line x1="8" y1="6" x2="21" y2="6" strokeWidth={2} strokeLinecap="round" />
                    <line x1="8" y1="12" x2="21" y2="12" strokeWidth={2} strokeLinecap="round" />
                    <line x1="8" y1="18" x2="21" y2="18" strokeWidth={2} strokeLinecap="round" />
                    <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth={2.5} strokeLinecap="round" />
                    <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth={2.5} strokeLinecap="round" />
                    <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth={2.5} strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {model.images && model.images.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {model.images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 dark:border-navy-border bg-slate-100 dark:bg-navy-950 cursor-pointer shadow-sm hover:border-accent-400 dark:hover:border-accent-500 hover:shadow-md transition-all duration-200"
                    >
                      <img
                        src={img.url}
                        alt={`${model.basicDeatils?.fullName} Portfolio ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-white/95 dark:bg-navy-card/95 backdrop-blur-sm rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 border dark:border-navy-border shadow-lg">
                          Preview
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {model.images.map((img, index) => {
                    const cleanName = getCleanFileName(img.path || img.url);
                    const formattedSize = formatFileSize(img.size);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0f1422] border border-slate-205 dark:border-navy-border rounded-xl transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-navy-border bg-slate-100 dark:bg-navy-950 shrink-0 shadow-sm">
                            <img
                              src={img.url}
                              alt={cleanName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0 gap-0.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{cleanName}</span>
                            <span className="text-[10px] text-slate-405 dark:text-slate-500 font-medium">
                              {formattedSize} • {img.mimeType || 'image/jpeg'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className="px-3 py-1.5 bg-white dark:bg-navy-card hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-border rounded-lg text-[10px] font-bold tracking-wide transition-all shadow-sm cursor-pointer flex items-center gap-1.5 focus:outline-none"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-505">No images added in portfolio.</div>
            )}
          </div>
        </div>

        {/* Right Side Info & Contacts */}
        <div className="flex flex-col gap-6">
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-5 transition-colors duration-200">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500  tracking-widest border-b border-slate-100 dark:border-navy-border/50 pb-2.5">
              Contact & Registration
            </h3>

            <div className="flex flex-col gap-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center border border-slate-200 dark:border-navy-border shrink-0">
                  <svg className="w-4 h-4 text-slate-405" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500  font-bold tracking-wider">Email Address</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {model.basicDeatils?.email}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center border border-slate-200 dark:border-navy-border shrink-0">
                  <svg className="w-4 h-4 text-slate-405" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500  font-bold tracking-wider">Phone Number</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5">{formattedPrimaryContact}</span>
                </div>
              </div>

              {formattedSecondaryContact && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center border border-slate-200 dark:border-navy-border shrink-0">
                    <svg className="w-4 h-4 text-slate-405" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500  font-bold tracking-wider">Alternative Phone</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5">{formattedSecondaryContact}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center border border-slate-200 dark:border-navy-border shrink-0">
                  <svg className="w-4 h-4 text-slate-405" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500  font-bold tracking-wider">Gender Identity</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5">{model.basicDeatils?.gender}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center border border-slate-200 dark:border-navy-border shrink-0">
                  <svg className="w-4 h-4 text-slate-405" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500  font-bold tracking-wider">Base Location</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {[model.address?.city?.name, model.address?.state?.name, model.address?.country?.name].filter(Boolean).join(', ') || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center border border-slate-200 dark:border-navy-border shrink-0">
                  <svg className="w-4 h-4 text-slate-405" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500  font-bold tracking-wider">Street Address</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {model.address?.addressLine1 ? `${model.address.addressLine1}${model.address.addressLine2 ? ', ' + model.address.addressLine2 : ''}` : 'N/A'}
                    {model.address?.postalCode ? ` (${model.address.postalCode})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-950 flex items-center justify-center border border-slate-200 dark:border-navy-border shrink-0">
                  <svg className="w-4 h-4 text-slate-405" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-505  font-bold tracking-wider">Registration Date</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatDate(model.createdAt, { year: 'numeric', month: 'long', day: 'numeric' }) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Attributes Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-200">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-505  tracking-widest border-b border-slate-100 dark:border-navy-border/50 pb-2.5">
              Physical Attributes
            </h3>

            <div className="flex flex-col gap-3 text-xs text-slate-700 dark:text-slate-300">
              {model.physicalCharacteristics?.complexion && (
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50/50 dark:bg-[#0f1422]/50 border border-slate-100 dark:border-navy-border/30 rounded-xl transition-all">
                  <span className="text-slate-400 font-bold text-[10px]  tracking-wider">Complexion</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{model.physicalCharacteristics.complexion}</span>
                </div>
              )}
              {model.physicalCharacteristics?.bodyShape && (
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50/50 dark:bg-[#0f1422]/50 border border-slate-100 dark:border-navy-border/30 rounded-xl transition-all">
                  <span className="text-slate-400 font-bold text-[10px]  tracking-wider">Body Shape</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{model.physicalCharacteristics.bodyShape}</span>
                </div>
              )}
              {model.measurements?.shoulder && (
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50/50 dark:bg-[#0f1422]/50 border border-slate-100 dark:border-navy-border/30 rounded-xl transition-all">
                  <span className="text-slate-400 font-bold text-[10px]  tracking-wider">Shoulder</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{model.measurements.shoulder}</span>
                </div>
              )}
              {model.measurements?.chest && (
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50/50 dark:bg-[#0f1422]/50 border border-slate-100 dark:border-navy-border/30 rounded-xl transition-all">
                  <span className="text-slate-400 font-bold text-[10px]  tracking-wider">Chest</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{model.measurements.chest}</span>
                </div>
              )}
              {model.measurements?.bust && (
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50/50 dark:bg-[#0f1422]/50 border border-slate-100 dark:border-navy-border/30 rounded-xl transition-all">
                  <span className="text-slate-400 font-bold text-[10px]  tracking-wider">Bust</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{model.measurements.bust}</span>
                </div>
              )}
              {model.measurements?.waist && (
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50/50 dark:bg-[#0f1422]/50 border border-slate-100 dark:border-navy-border/30 rounded-xl transition-all">
                  <span className="text-slate-400 font-bold text-[10px]  tracking-wider">Waist</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{model.measurements.waist}</span>
                </div>
              )}
              {model.measurements?.hips && (
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50/50 dark:bg-[#0f1422]/50 border border-slate-100 dark:border-navy-border/30 rounded-xl transition-all">
                  <span className="text-slate-400 font-bold text-[10px]  tracking-wider">Hips</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{model.measurements.hips}</span>
                </div>
              )}
              {model.measurements?.shoe && (
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50/50 dark:bg-[#0f1422]/50 border border-slate-100 dark:border-navy-border/30 rounded-xl transition-all">
                  <span className="text-slate-400 font-bold text-[10px]  tracking-wider">Shoe Size</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{model.measurements.shoe}</span>
                </div>
              )}
              {model.physicalCharacteristics?.eyeColor && (
                <div className="flex justify-between items-center py-2 px-3 bg-slate-50/50 dark:bg-[#0f1422]/50 border border-slate-100 dark:border-navy-border/30 rounded-xl transition-all">
                  <span className="text-slate-400 font-bold text-[10px]  tracking-wider">Eye Color</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{model.physicalCharacteristics.eyeColor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Biography Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-200">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-550  tracking-widest border-b border-slate-100 dark:border-navy-border/50 pb-2.5">
              Biography
            </h3>
            <div className="relative">
              {/* Quote Mark Watermark */}
              <span className="absolute -top-3 -left-2 text-slate-100 dark:text-navy-950 font-serif text-5xl select-none leading-none -z-10 opacity-60">“</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50/40 dark:bg-navy-950/20 p-4 rounded-xl border border-slate-100 dark:border-navy-border/20 relative z-10">
                {model.bio || 'No biography details provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Overlay Modal */}
      {activeImageIndex !== null && model.images && model.images[activeImageIndex] && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center select-none">
          <div className="absolute inset-0 cursor-default" onClick={() => setActiveImageIndex(null)} />
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-6 right-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative w-full max-w-5xl px-12 flex items-center justify-center z-10">
            <button
              onClick={() =>
                setActiveImageIndex((activeImageIndex - 1 + model.images.length) % model.images.length)
              }
              className="absolute left-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex flex-col items-center gap-3">
              <img
                src={model.images[activeImageIndex].url}
                alt={`${model.basicDeatils?.fullName} Large Portfolio`}
                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl border border-slate-800/40"
              />
              <span className="text-xs font-semibold text-slate-400">
                Image {activeImageIndex + 1} of {model.images.length}
              </span>
            </div>

            <button
              onClick={() => setActiveImageIndex((activeImageIndex + 1) % model.images.length)}
              className="absolute right-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Share Profile Modal */}
      <ShareModelModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        modelId={model.id}
      />
    </div>
  );
};

export default ModelDetails;
