import React, { useState, useEffect, useRef } from 'react';
import ImageCropper from '../../../components/ui/ImageCropper';
import { useUpdateModelProfilePictureMutation } from '../../../redux/services/models';
import toast from 'react-hot-toast';

interface ProfilePictureUploaderProps {
  modelId: string;
  fullName?: string;
  profilePictureUrl?: string;
  editable: boolean;
}

export const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({
  modelId,
  fullName = 'Model',
  profilePictureUrl,
  editable,
}) => {
  const [updateModelProfilePicture] = useUpdateModelProfilePictureMutation();
  const [showDpDropdown, setShowDpDropdown] = useState(false);
  const [showDpPreview, setShowDpPreview] = useState(false);
  const [cropperImgSrc, setCropperImgSrc] = useState<string | null>(null);
  
  const dpDropdownRef = useRef<HTMLDivElement>(null);
  const dpFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dpDropdownRef.current && !dpDropdownRef.current.contains(event.target as Node)) {
        setShowDpDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemovePicture = async () => {
    try {
      await toast.promise(
        updateModelProfilePicture({ id: modelId, body: { remove: true } }).unwrap(),
        {
          loading: 'Removing profile picture...',
          success: 'Profile picture removed successfully!',
          error: 'Failed to remove profile picture',
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCropDone = async (croppedBlob: Blob) => {
    if (cropperImgSrc && cropperImgSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropperImgSrc);
    }
    setCropperImgSrc(null);

    const file = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await toast.promise(
        updateModelProfilePicture({ id: modelId, body: formData }).unwrap(),
        {
          loading: 'Uploading cropped profile picture...',
          success: 'Profile picture updated successfully!',
          error: 'Failed to upload profile picture',
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const primaryImageUrl = profilePictureUrl || '';

  return (
    <div className="relative shrink-0" ref={dpDropdownRef}>
      <div
        onClick={() => {
          if (editable) {
            if (primaryImageUrl) {
              setShowDpDropdown(!showDpDropdown);
            } else {
              dpFileInputRef.current?.click();
            }
          } else if (primaryImageUrl) {
            setShowDpPreview(true);
          }
        }}
        className="w-32 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 dark:border-navy-border shadow-md ring-4 ring-slate-100/80 dark:ring-navy-900/50 relative group cursor-pointer"
      >
        {primaryImageUrl ? (
          <>
            <img
              src={primaryImageUrl}
              alt={fullName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {editable ? (
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-center gap-1.5 p-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="text-[9px] font-bold tracking-wider">Edit Photo</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-center gap-1.5 p-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-[9px] font-bold tracking-wider">View Photo</span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-[#0c101d] flex items-center justify-center text-slate-400 dark:text-slate-550 transition-colors">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown options menu */}
      {showDpDropdown && editable && (
        <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-xl shadow-xl z-[150] py-1 text-left">
          {primaryImageUrl && (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowDpDropdown(false);
                  setShowDpPreview(true);
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-950 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Picture
              </button>
              <div className="border-t border-slate-100 dark:border-navy-border/50 my-1" />
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setShowDpDropdown(false);
              dpFileInputRef.current?.click();
            }}
            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-950 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload New
          </button>
          {primaryImageUrl && (
            <>
              <div className="border-t border-slate-100 dark:border-navy-border/50 my-1" />
              <button
                type="button"
                onClick={() => {
                  setShowDpDropdown(false);
                  handleRemovePicture();
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-red-550 dark:text-red-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Picture
              </button>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={dpFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setCropperImgSrc(url);
            e.target.value = '';
          }
        }}
      />

      {/* Profile Picture Fullscreen Preview modal */}
      {showDpPreview && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="relative max-w-full max-h-[85vh] p-2 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex items-center justify-center">
            <button
              onClick={() => setShowDpPreview(false)}
              className="absolute top-4 right-4 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10 cursor-pointer"
              aria-label="Close Preview"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={primaryImageUrl}
              alt="Profile Full Size"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-inner"
            />
          </div>
        </div>
      )}

      {cropperImgSrc && (
        <ImageCropper
          imageSrc={cropperImgSrc}
          aspectRatio={1}
          onCancel={() => {
            if (cropperImgSrc && cropperImgSrc.startsWith('blob:')) {
              URL.revokeObjectURL(cropperImgSrc);
            }
            setCropperImgSrc(null);
          }}
          onCropDone={handleCropDone}
        />
      )}
    </div>
  );
};
