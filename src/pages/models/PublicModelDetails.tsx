import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetPublicSharedModelDetailsQuery } from '../../redux/services/models';
import Skeleton from '../../components/ui/Skeleton';
import { getErrorMessage } from '../../utils/errorHelper';
import Unauthorized from '../../components/ui/Unauthorized';
import { formatMeasurement } from '../../utils/helperfunction';

export const PublicModelDetails: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { data: modelRes, isLoading, error } = useGetPublicSharedModelDetailsQuery(token || '');
  const model = modelRes?.data;


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
      <div className="min-h-screen bg-slate-50 dark:bg-navy-900 flex flex-col items-center p-6">
        <div className="w-full max-w-5xl flex flex-col gap-6">
          <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-navy-border">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            <Skeleton className="w-full md:w-1/3 h-96 rounded-2xl" />
            <div className="flex-1 flex flex-col gap-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - e.g. Link expired or invalid
  if (error || !model) {
    const errorMessage = getErrorMessage(error, 'The link you followed is invalid, has expired, or has been revoked.');
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center p-6">
        <Unauthorized message={errorMessage} />
      </div>
    );
  }

  const primaryImageUrl = model.profilePicture?.url || '';
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 font-sans pb-16">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-navy-card/80 backdrop-blur-md border-b border-slate-200 dark:border-navy-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src="/logo.png" alt="Pizlio Models Logo" className="h-10 object-contain dark:invert select-none" />
          <div className="flex items-center gap-2 text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              TEMPORARY ACCESS LINK (24H)
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Profile Card and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Primary Details Card */}
            <div className="bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 dark:from-navy-card dark:via-navy-950/10 dark:to-navy-card border border-slate-200 dark:border-navy-border rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-center gap-6 shadow-sm relative">
              <div className="relative shrink-0">
                <div
                  onClick={() => {
                    if (primaryImageUrl) {
                      // We can preview it or do nothing
                      // wait, let's keep it consistent
                    }
                  }}
                  className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-navy-border shadow-md ring-4 ring-slate-100 dark:ring-navy-900/50 relative group cursor-pointer"
                >
                  {primaryImageUrl ? (
                    <>
                      <img
                        src={primaryImageUrl}
                        alt={model.basicDeatils?.fullName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-center gap-1.5 p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-wider">View Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-[#0c101d] flex items-center justify-center text-slate-400 dark:text-slate-550 transition-colors">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {model.basicDeatils?.fullName}
                  </h1>

                  <div className="flex items-center gap-3.5 flex-wrap text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide mt-1">
                    <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-navy-950/40 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-navy-border/20">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{model.basicDeatils?.email}</span>
                    </div>

                    {model.address?.country && (
                      <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-navy-950/40 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-navy-border/20">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Age</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                      {model.basicDeatils?.age} yrs
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 bg-white/70 dark:bg-navy-card/50 border border-slate-150 dark:border-navy-border/40 rounded-2xl shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Height</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                      {model.measurements?.height}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 bg-white/70 dark:bg-navy-card/50 border border-slate-150 dark:border-navy-border/40 rounded-2xl shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Weight</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                      {model.measurements?.weight ? `${model.measurements.weight} kg` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Intro (If available) */}
            {model.introVideo && (
              <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-navy-border/50 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 flex items-center justify-center border border-accent-100 dark:border-accent-900/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wider">Video Introduction</h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Talent overview presentation reel</span>
                  </div>
                </div>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-navy-border shadow-lg">
                  <video src={model.introVideo.url} controls className="w-full h-full object-contain" />
                </div>
              </div>
            )}

            {/* Portfolio Gallery */}
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wider">Portfolio Gallery</h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Model's book of photos ({model.images?.length || 0})</span>
                  </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-navy-950 p-1 rounded-xl border border-slate-200/50 dark:border-navy-border/30">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-navy-card text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-navy-card text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {model.images && model.images.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {model.images.map((img: any, idx: number) => (
                      <div
                        key={img.id}
                        onClick={() => setActiveImageIndex(idx)}
                        className="aspect-[3/4] bg-slate-100 dark:bg-navy-950 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-navy-border/40 hover:border-slate-350 dark:hover:border-navy-border shadow-sm group relative cursor-pointer"
                      >
                        <img src={img.url} alt="Portfolio thumbnail" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {model.images.map((img: any, idx: number) => (
                      <div
                        key={img.id}
                        onClick={() => setActiveImageIndex(idx)}
                        className="bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/60 dark:border-navy-border/40 p-4 flex items-center gap-4 hover:border-slate-300 dark:hover:border-navy-border transition-colors cursor-pointer group"
                      >
                        <img src={img.url} alt="Portfolio thumbnail" className="w-16 h-20 object-cover rounded-xl border border-slate-200 dark:border-navy-border shadow-sm" />
                        <div className="flex-1 text-left">
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Portfolio Book #{idx + 1}</h4>
                          <span className="text-[10px] text-slate-400 mt-1 block">Image Asset Details</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 flex items-center gap-1">
                          View
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="py-12 border border-dashed border-slate-200 dark:border-navy-border/60 rounded-2xl text-center text-slate-400">
                  No portfolio images uploaded.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Physical Attributes & Bio */}
          <div className="flex flex-col gap-6">
            
            {/* Characteristics Card */}
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wider border-b border-slate-100 dark:border-navy-border pb-3 uppercase text-left">
                Physical Attributes
              </h3>
              
              <div className="flex flex-col gap-4 text-left">
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Gender</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{model.basicDeatils?.gender}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Complexion</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{model.physicalCharacteristics?.complexion || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Body Shape</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{model.physicalCharacteristics?.bodyShape || 'N/A'}</span>
                </div>
                {model.basicDeatils?.modelType && (
                  <div className="flex justify-between items-center text-xs py-0.5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Model Type</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">{model.basicDeatils.modelType}</span>
                  </div>
                )}
                {model.measurements?.size && (
                  <div className="flex justify-between items-center text-xs py-0.5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Size Chart</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">{model.measurements.size}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Eye Color</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{model.physicalCharacteristics?.eyeColor || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Hair Color</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{model.physicalCharacteristics?.hairColor || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Bust / Chest</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">
                    {model.measurements?.bust && model.measurements?.chest
                      ? `${formatMeasurement(model.measurements.bust, 'in')} / ${formatMeasurement(model.measurements.chest, 'in')}`
                      : formatMeasurement(model.measurements?.bust || model.measurements?.chest, 'in') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Waist</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">
                    {formatMeasurement(model.measurements?.waist, 'in') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Hips</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">
                    {formatMeasurement(model.measurements?.hips, 'in') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Shoe Size</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{model.measurements?.shoe || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Shoulder width</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">
                    {formatMeasurement(model.measurements?.shoulder, 'cm') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio Card */}
            <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wider border-b border-slate-100 dark:border-navy-border pb-3 uppercase text-left">
                Biography / Cover
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed text-left whitespace-pre-line">
                {model.bio || 'No biography details provided.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Overlay Modal */}
      {activeImageIndex !== null && model.images && model.images[activeImageIndex] && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex items-center justify-center select-none">
          <div className="absolute inset-0 cursor-default" onClick={() => setActiveImageIndex(null)} />
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-6 right-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors z-10 cursor-pointer"
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
              className="absolute left-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors cursor-pointer"
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
              className="absolute right-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicModelDetails;
