import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useModel, useDeleteModel } from './modelsHooks';
import { useAppAbility } from '../../context/AbilityContext';
import Button from '../../components/Button';
import NestedDrawer from '../../components/NestedDrawer';
import ModelForm from './ModelForm';

export const ModelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ability = useAppAbility();

  const { data: model, isLoading, error } = useModel(id || '');
  const deleteMutation = useDeleteModel();

  // Drawer Edit Form state
  const [isEditOpen, setIsEditOpen] = useState(false);

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
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="h-[300px] bg-slate-200 rounded-2xl" />
            <div className="h-[200px] bg-slate-200 rounded-2xl" />
          </div>
          <div className="h-[400px] bg-slate-200 rounded-2xl" />
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
          <Button variant="secondary" size="sm">Back to Roster</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${model.name}'s profile?`)) {
      deleteMutation.mutate(model.id, {
        onSuccess: () => {
          navigate('/models');
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Back navigation header */}
      <div className="flex items-center justify-between">
        <Link
          to="/models"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors uppercase tracking-wider"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Talent Roster
        </Link>

        <div className="flex items-center gap-2">
          {ability.can('update', 'Model') && (
            <Button
              onClick={() => setIsEditOpen(true)}
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
          {ability.can('delete', 'Model') && (
            <Button
              onClick={handleDelete}
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
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
        {/* Left Side: General Profile Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Info Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-sm transition-colors duration-200">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-navy-border shadow-inner">
              <img
                src={model.imageUrl}
                alt={model.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">{model.name}</h2>
                  <span
                    className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      model.status === 'Active'
                        ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30'
                        : model.status === 'On-Leave'
                        ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30'
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/30'
                    }`}
                  >
                    {model.status}
                  </span>
                </div>
                <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-widest">{model.category} Division</span>
              </div>

              {/* Stat badges */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-[#0f1422] border border-slate-200 dark:border-navy-border p-4 rounded-xl text-center mt-1 transition-colors duration-200">
                <div className="flex flex-col gap-0.5 border-r border-slate-200 dark:border-navy-border">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Age</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{model.age} yrs</span>
                </div>
                <div className="flex flex-col gap-0.5 border-r border-slate-200 dark:border-navy-border">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Height</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{model.height} cm</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Weight</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{model.weight} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Portfolio Gallery */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-5 transition-colors duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-border pb-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Model Portfolio</h3>
                <span className="text-xs text-slate-400 dark:text-slate-550">Multiple photos and studio registers ({model.images?.length || 1} images)</span>
              </div>

              {/* Grid / List Toggler */}
              <div className="flex items-center gap-1 bg-slate-105 dark:bg-navy-950 p-1 rounded-lg border border-slate-200 dark:border-navy-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-navy-card text-accent-600 dark:text-accent-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Grid View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-navy-card text-accent-600 dark:text-accent-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="List View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Gallery Content */}
            {model.images && model.images.length > 0 ? (
              viewMode === 'grid' ? (
                /* Grid view: 3 Columns */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {model.images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 dark:border-navy-border bg-slate-100 dark:bg-navy-950 cursor-pointer shadow-sm hover:border-accent-400 dark:hover:border-accent-500 hover:shadow-md transition-all duration-200"
                    >
                      <img
                        src={img}
                        alt={`${model.name} Portfolio ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-white/95 dark:bg-navy-card/95 backdrop-blur-sm rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 border dark:border-navy-border shadow-lg flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List view: Vertically stacked large cards */
                <div className="flex flex-col gap-6">
                  {model.images.map((img, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 dark:bg-[#0f1422] border border-slate-200 dark:border-navy-border rounded-xl overflow-hidden shadow-sm flex flex-col transition-colors duration-200"
                    >
                      <div className="relative aspect-[16/10] w-full">
                        <img
                          src={img}
                          alt={`${model.name} Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setActiveImageIndex(index)}
                          className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/95 dark:bg-navy-card/95 backdrop-blur-sm hover:bg-white text-slate-800 dark:text-slate-200 shadow-md flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-navy-border cursor-pointer font-bold text-xs"
                        >
                          <svg className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Full Preview
                        </button>
                      </div>
                      <div className="p-4 border-t border-slate-200 dark:border-navy-border bg-white dark:bg-navy-card flex justify-between items-center transition-colors duration-200">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Studio Image #{index + 1}</span>
                        <span className="text-xs text-slate-405 dark:text-slate-500 font-medium">Dimension Aspect 4:5</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">No images added in portfolio.</div>
            )}
          </div>
        </div>

        {/* Right Side: Details Biography & Contacts */}
        <div className="flex flex-col gap-6">
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-200">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Contact & Registration</h3>
            <div className="flex flex-col gap-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-2.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Email Address</span>
                <span className="font-bold text-slate-900 dark:text-white truncate">{model.email}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-2.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Phone Number</span>
                <span className="font-bold text-slate-900 dark:text-white">{model.phone}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-2.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Gender Identity</span>
                <span className="font-bold text-slate-900 dark:text-white">{model.gender}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-2.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Location</span>
                <span className="font-bold text-slate-900 dark:text-white">{model.city}, {model.state}, {model.country}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Registration Date</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(model.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Biography Card */}
          <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-200">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Biography</h3>
            <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0f1422] border border-slate-150 dark:border-navy-border p-4 rounded-xl transition-colors duration-200">
              {model.bio || 'No biography details provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sliding Drawer: Edit Profile Drawer */}
      <NestedDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Model Profile"
        stackIndex={0}
        size="lg"
      >
        <ModelForm
          modelId={model.id}
          initialValues={model}
          onSuccess={() => setIsEditOpen(false)}
        />
      </NestedDrawer>

      {/* Lightbox Overlay Modal */}
      {activeImageIndex !== null && model.images && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center select-none">
          {/* Close Backdrop Trigger */}
          <div className="absolute inset-0 cursor-default" onClick={() => setActiveImageIndex(null)} />

          {/* X Close Button */}
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-6 right-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors z-10"
            title="Close Lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image and Arrows Container */}
          <div className="relative w-full max-w-5xl px-12 flex items-center justify-center z-10">
            {/* Prev arrow */}
            <button
              onClick={() =>
                setActiveImageIndex((activeImageIndex - 1 + model.images.length) % model.images.length)
              }
              className="absolute left-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors"
              title="Previous Image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Displaying Image */}
            <div className="flex flex-col items-center gap-3">
              <img
                src={model.images[activeImageIndex]}
                alt={`${model.name} Large Portfolio`}
                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl border border-slate-800/40"
              />
              <span className="text-xs font-semibold text-slate-400">
                Image {activeImageIndex + 1} of {model.images.length}
              </span>
            </div>

            {/* Next arrow */}
            <button
              onClick={() => setActiveImageIndex((activeImageIndex + 1) % model.images.length)}
              className="absolute right-6 p-2 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-full border border-slate-700/50 transition-colors"
              title="Next Image"
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

export default ModelDetails;
