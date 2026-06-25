import React, { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IUser } from '../../../interface/user';
import { useUploadProfilePictureMutation } from '../../../redux/services/auth';
import ImageCropper from '../../../components/ui/ImageCropper';

interface ProfileHeaderProps {
  user: IUser | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [uploadProfilePicture, { isLoading: isSaving }] = useUploadProfilePictureMutation();

  const [cropperImgSrc, setCropperImgSrc] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const currentProfilePicture = user?.profilePicture || '';
  const hasProfilePicture = !!currentProfilePicture && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [currentProfilePicture]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        showDropdown &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showDropdown]);

  const handleAvatarClick = () => {
    if (isSaving) return;
    if (hasProfilePicture) {
      setShowDropdown((prev) => !prev);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleRemovePicture = async () => {
    setShowDropdown(false);
    try {
      await toast.promise(
        uploadProfilePicture({ remove: true }).unwrap(),
        {
          loading: 'Removing profile picture...',
          success: 'Profile picture removed successfully!',
          error: 'Failed to remove profile picture',
        }
      );
    } catch (err) {
      console.error('Failed to remove profile picture:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const url = URL.createObjectURL(file);
      setCropperImgSrc(url);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-2xl shadow-sm transition-colors duration-200">
      <div className="h-32 bg-gradient-to-r from-accent-600 to-indigo-600/80 relative rounded-t-[15px]" />
      
      <div className="px-6 pb-6 pt-4 flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-10 relative z-10">
        <div ref={containerRef} className="relative">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleAvatarClick}
            className="w-24 h-24 shrink-0 aspect-square rounded-full bg-gradient-to-br from-accent-400 to-indigo-500 text-white border-4 border-white dark:border-navy-card flex items-center justify-center overflow-hidden font-bold text-3xl shadow-md transition-all cursor-pointer hover:opacity-90 hover:scale-[1.02] focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="flex flex-col items-center justify-center gap-1">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-[10px] font-semibold tracking-wider uppercase">Saving...</span>
              </div>
            ) : currentProfilePicture && !imgError ? (
              <img
                src={currentProfilePicture}
                alt=""
                crossOrigin="anonymous"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.fullName?.charAt(0) || 'U'
            )}
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            disabled={isSaving}
            onClick={handleAvatarClick}
            className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-accent-600 rounded-full shadow-md cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Action Dropdown Menu */}
          {showDropdown && hasProfilePicture && (
            <div 
              ref={dropdownRef}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-xl shadow-xl z-20 py-1 text-left"
            >
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  setShowPreview(true);
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-950 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Picture
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  fileInputRef.current?.click();
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-950 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload New
              </button>

              <div className="border-t border-slate-100 dark:border-navy-border/50 my-1" />

              <button
                type="button"
                onClick={handleRemovePicture}
                className="w-full px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-red-550 dark:text-red-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Picture
              </button>
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center sm:text-left mb-1">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{user?.fullName}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user?.department || 'Agency Personnel'}</p>
        </div>
        
        <div className="sm:mb-2">
          <span className="px-3.5 py-1 bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-accent-100 dark:border-accent-800/30">
            {user?.role?.name || 'User'} Role
          </span>
        </div>
      </div>

      {/* Preview Full Size Image Modal */}
      {showPreview && hasProfilePicture && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-all duration-300"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] p-2 bg-white dark:bg-navy-card rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10 cursor-pointer"
              aria-label="Close Preview"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={currentProfilePicture}
              alt="Profile Full Size"
              crossOrigin="anonymous"
              className="max-w-full max-h-[80vh] rounded-lg object-contain shadow-inner"
            />
          </div>
        </div>
      )}

      {cropperImgSrc && (
        <ImageCropper
          imageSrc={cropperImgSrc}
          aspectRatio={1}
          onCancel={() => {
            if (cropperImgSrc.startsWith('blob:')) {
              URL.revokeObjectURL(cropperImgSrc);
            }
            setCropperImgSrc(null);
          }}
          onCropDone={async (croppedBlob) => {
            if (cropperImgSrc.startsWith('blob:')) {
              URL.revokeObjectURL(cropperImgSrc);
            }
            setCropperImgSrc(null);

            const file = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
            try {
              await toast.promise(
                uploadProfilePicture({ file }).unwrap(),
                {
                  loading: 'Uploading cropped profile picture...',
                  success: 'Profile picture updated successfully!',
                  error: 'Failed to upload profile picture',
                }
              );
            } catch (err) {
              console.error('Cropped picture upload error:', err);
            }
          }}
        />
      )}
    </div>
  );
};

export default ProfileHeader;
