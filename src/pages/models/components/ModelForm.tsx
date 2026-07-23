import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from '../../../components/ui/DatePicker';
import ImageCropper from '../../../components/ui/ImageCropper';
import { ModelFormSchema, ModelFormData } from '../ModelSchema';
import {
  useAddModelMutation,
  useUpdateModelMutation
} from '../../../redux/services/models';
import FormInput from '../../../components/ui/FormInput';
import NumberInput from '../../../components/ui/NumberInput';
import SearchDropdown from '../../../components/ui/SearchDropdown';
import MultiSelectSearchDropdown from '../../../components/ui/MultiSelectSearchDropdown';
import Button from '../../../components/ui/Button';
import CountrySingleSelect from '../../../components/ui/CountrySingleSelect';
import StateSingleSelect from '../../../components/ui/StateSingleSelect';
import CitySingleSelect from '../../../components/ui/CitySingleSelect';
import PhoneInputField from '../../../components/ui/PhoneInputField';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorHelper';
import { parsePhoneString } from '../../../utils/helperfunction';

interface ModelFormProps {
  modelId?: string;
  initialValues?: any;
  onSuccess: () => void;
}

export const ModelForm: React.FC<ModelFormProps> = ({ modelId, initialValues, onSuccess }) => {
  const [addModel, { isLoading: isAdding }] = useAddModelMutation();
  const [updateModel, { isLoading: isUpdating }] = useUpdateModelMutation();
  const isEdit = !!modelId;

  // Profile picture file states for Add Mode
  const [profilePictureFile, setProfilePictureFile] = React.useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = React.useState<string | null>(null);
  const [cropperImgSrc, setCropperImgSrc] = React.useState<string | null>(null);

  // Cleanup Object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview);
      }
      if (cropperImgSrc && cropperImgSrc.startsWith('blob:')) {
        URL.revokeObjectURL(cropperImgSrc);
      }
    };
  }, [profilePicturePreview, cropperImgSrc]);

  const handleCropDone = (croppedBlob: Blob) => {
    if (cropperImgSrc && cropperImgSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropperImgSrc);
    }
    setCropperImgSrc(null);

    const croppedFile = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
    setProfilePictureFile(croppedFile);
    setProfilePicturePreview(URL.createObjectURL(croppedFile));
  };

  const handleCropCancel = () => {
    if (cropperImgSrc && cropperImgSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropperImgSrc);
    }
    setCropperImgSrc(null);
  };

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ModelFormData>({
    resolver: zodResolver(ModelFormSchema),
    defaultValues: {
      basicDeatils: {
        fullName: initialValues?.basicDeatils?.fullName || '',
        email: initialValues?.basicDeatils?.email || '',
        primartContact: {
          code: initialValues?.basicDeatils?.primartContact?.code || '+91',
          number: initialValues?.basicDeatils?.primartContact?.number || '',
        },
        secondryContact: {
          code: initialValues?.basicDeatils?.secondryContact?.code || '+91',
          number: initialValues?.basicDeatils?.secondryContact?.number || '',
        },
        age: initialValues?.basicDeatils?.age || undefined,
        dob: initialValues?.basicDeatils?.dob ? new Date(initialValues.basicDeatils.dob).toISOString().split('T')[0] : '',
        gender: initialValues?.basicDeatils?.gender || '',
        modelType: Array.isArray(initialValues?.basicDeatils?.modelType)
          ? initialValues.basicDeatils.modelType
          : (typeof initialValues?.basicDeatils?.modelType === 'string'
            ? initialValues.basicDeatils.modelType.split(',').map((s: string) => s.trim()).filter(Boolean)
            : ['Beginner']),
      },
      physicalCharacteristics: {
        complexion: initialValues?.physicalCharacteristics?.complexion || '',
        bodyShape: initialValues?.physicalCharacteristics?.bodyShape || '',
        eyeColor: initialValues?.physicalCharacteristics?.eyeColor || '',
        hairColor: initialValues?.physicalCharacteristics?.hairColor || '',
      },
      measurements: {
        height: initialValues?.measurements?.height || '',
        weight: initialValues?.measurements?.weight ? String(initialValues.measurements.weight) : '',
        bust: initialValues?.measurements?.bust || '',
        waist: initialValues?.measurements?.waist || '',
        hips: initialValues?.measurements?.hips || '',
        shoe: initialValues?.measurements?.shoe || '',
        chest: initialValues?.measurements?.chest || '',
        shoulder: initialValues?.measurements?.shoulder || '',
        size: initialValues?.measurements?.size || '',
      },
      address: {
        addressLine1: initialValues?.address?.addressLine1 || '',
        addressLine2: initialValues?.address?.addressLine2 || '',
        country: initialValues?.address?.country?.id || '',
        state: initialValues?.address?.state?.id || '',
        city: initialValues?.address?.city?.id || '',
        postalCode: initialValues?.address?.postalCode || '',
      },
      bio: initialValues?.bio || '',
      files: [],
      profilePicture: initialValues?.profilePicture?.id || undefined,
    }
  });

  const initialHeight = useMemo(() => {
    const heightStr = initialValues?.measurements?.height || '';
    const match = heightStr.match(/(\d+)\s*fit\s*(\d+)\s*inch/);
    if (match) {
      return { feet: parseInt(match[1], 10), inches: parseInt(match[2], 10) };
    }
    return { feet: 5, inches: 0 };
  }, [initialValues?.measurements?.height]);

  const [heightFeet, setHeightFeet] = React.useState<string>(initialValues?.measurements?.height ? String(initialHeight.feet) : '');
  const [heightInches, setHeightInches] = React.useState<string>(initialValues?.measurements?.height ? String(initialHeight.inches) : '');

  useEffect(() => {
    const heightStr = initialValues?.measurements?.height || '';
    const match = heightStr.match(/(\d+)\s*fit\s*(\d+)\s*inch/);
    const feet = match ? match[1] : '';
    const inches = match ? match[2] : '';
    setHeightFeet(feet);
    setHeightInches(inches);
    if (heightStr) {
      setValue('measurements.height', heightStr);
    }
  }, [initialValues?.measurements?.height, setValue]);

  const selectedCountry = watch('address.country') || '';
  const selectedState = watch('address.state') || '';
  const watchedDob = watch('basicDeatils.dob');

  const calculatedAge = useMemo(() => {
    if (!watchedDob) return null;
    const birthDate = new Date(watchedDob);
    let age = new Date().getFullYear() - birthDate.getFullYear();
    const m = new Date().getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  }, [watchedDob]);

  useEffect(() => {
    if (calculatedAge !== null) {
      setValue('basicDeatils.age', calculatedAge, { shouldValidate: true });
    }
  }, [calculatedAge, setValue]);





  const onSubmit = async (data: ModelFormData) => {
    const payload: any = {
      basicDeatils: data.basicDeatils,
      physicalCharacteristics: data.physicalCharacteristics,
      measurements: data.measurements,
      address: data.address,
      bio: data.bio,
    };

    try {
      const formData = new FormData();

      // Serialize nested objects into strings to support Multer text fields parsing
      formData.append('basicDeatils', JSON.stringify(payload.basicDeatils));
      formData.append('physicalCharacteristics', JSON.stringify(payload.physicalCharacteristics));
      formData.append('measurements', JSON.stringify(payload.measurements));
      formData.append('address', JSON.stringify(payload.address));
      formData.append('bio', payload.bio);
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }

      if (isEdit && modelId) {
        await updateModel({ id: modelId, body: formData }).unwrap();
        toast.success('Model profile updated successfully!');
        onSuccess();
      } else {
        await addModel(formData).unwrap();
        toast.success('Model profile created successfully!');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Failed to submit model form', err);
      toast.error(getErrorMessage(err, 'Submission failed'));
    }
  };

  const isPending = isAdding || isUpdating;

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Please fill in all required fields correctly.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-6 text-left pb-10">



      {/* ── SECTION 1: PROFILE PICTURE UPLOAD (Add Mode Only) ────────────────────── */}
      {!isEdit && (
        <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Profile Picture
            </h3>
            <span className="text-[10px] text-slate-404 dark:text-slate-500">Upload model profile photo (PNG, JPG, max 30MB).</span>
          </div>

          <div className="flex flex-col gap-4">
            {profilePicturePreview ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-slate-200 dark:border-navy-border shadow-md bg-slate-50 dark:bg-navy-950">
                  <img
                    src={profilePicturePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePictureFile(null);
                      if (profilePicturePreview) {
                        URL.revokeObjectURL(profilePicturePreview);
                      }
                      setProfilePicturePreview(null);
                    }}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
                    title="Remove Photo"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfilePictureFile(null);
                    if (profilePicturePreview) {
                      URL.revokeObjectURL(profilePicturePreview);
                    }
                    setProfilePicturePreview(null);
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-all border border-red-200/50 dark:border-red-800/30"
                >
                  Remove Picture
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-navy-border hover:border-accent-500/60 dark:hover:border-accent-500/60 hover:bg-slate-50/40 dark:hover:bg-[#0c101d]/10 rounded-xl p-8 cursor-pointer transition-all duration-200">
                  <div className="flex flex-col items-center gap-2.5 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-navy-950/40 text-slate-400 dark:text-slate-500 rounded-xl border dark:border-navy-border">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to select or drag & drop profile picture</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">PNG, JPG, or JPEG (Max 30MB)</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 30 * 1024 * 1024) {
                          toast.error('File size exceeds 30MB limit.');
                          return;
                        }
                        const url = URL.createObjectURL(file);
                        setCropperImgSrc(url);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
          {cropperImgSrc && (
            <ImageCropper
              imageSrc={cropperImgSrc}
              onCropDone={handleCropDone}
              onCancel={handleCropCancel}
            />
          )}
        </div>
      )}

      {/* ── SECTION 2: BASIC INFORMATION ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Basic Information
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-555">Personal details and primary contact methods.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Full Name"
            required
            placeholder="Enter model's name"
            error={errors.basicDeatils?.fullName?.message}
            {...register('basicDeatils.fullName')}
          />

          <FormInput
            label="Email Address"
            required
            placeholder="Enter model's email"
            error={errors.basicDeatils?.email?.message}
            {...register('basicDeatils.email')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="basicDeatils.primartContact"
            control={control}
            render={({ field, fieldState: { error, isTouched }, formState }) => {
              const fullPhone = field.value?.code && field.value?.number
                ? `${field.value.code}${field.value.number}`
                : '';
              const hasError = (!!error || !!errors.basicDeatils?.primartContact?.number?.message) && (isTouched || formState.isSubmitted);
              const helperText = hasError
                ? (error?.message || errors.basicDeatils?.primartContact?.number?.message || errors.basicDeatils?.primartContact?.code?.message)
                : '';
              return (
                <PhoneInputField
                  label="Primary Contact Number"
                  required
                  value={fullPhone}
                  error={hasError}
                  helperText={helperText}
                  onChange={(phoneStr) => {
                    const parsed = parsePhoneString(phoneStr);
                    setValue('basicDeatils.primartContact.code', parsed.countryCode ? `+${parsed.countryCode}` : '+91', { shouldValidate: true });
                    setValue('basicDeatils.primartContact.number', parsed.phone || '', { shouldValidate: true });
                  }}
                />
              );
            }}
          />

          <Controller
            name="basicDeatils.secondryContact"
            control={control}
            render={({ field, fieldState: { error, isTouched }, formState }) => {
              const fullPhone = field.value?.code && field.value?.number
                ? `${field.value.code}${field.value.number}`
                : '';
              const hasError = (!!error || !!errors.basicDeatils?.secondryContact?.number?.message) && (isTouched || formState.isSubmitted);
              const helperText = hasError
                ? (error?.message || errors.basicDeatils?.secondryContact?.number?.message || errors.basicDeatils?.secondryContact?.code?.message)
                : '';
              return (
                <PhoneInputField
                  label="Secondary Contact Number"
                  value={fullPhone}
                  error={hasError}
                  helperText={helperText}
                  onChange={(phoneStr) => {
                    const parsed = parsePhoneString(phoneStr);
                    setValue('basicDeatils.secondryContact.code', parsed.countryCode ? `+${parsed.countryCode}` : '+91', { shouldValidate: true });
                    setValue('basicDeatils.secondryContact.number', parsed.phone || '', { shouldValidate: true });
                  }}
                />
              );
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full flex flex-col gap-1.5 justify-start">
            <span className="text-[10px] md:text-xs font-bold text-slate-550 dark:text-slate-400 capitalize tracking-wider flex items-center gap-0.5">
              Date of Birth <span className="text-red-500 font-bold">*</span>
            </span>
            <Controller
              name="basicDeatils.dob"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="DD/MM/YYYY"
                  error={errors.basicDeatils?.dob?.message}
                />
              )}
            />
          </div>

          <FormInput
            label="Age (Calculated from DOB)"
            type="number"
            readOnly
            disabled
            placeholder="Select DOB to calculate age"
            error={errors.basicDeatils?.age?.message}
            {...register('basicDeatils.age', { valueAsNumber: true })}
            className="bg-slate-50 dark:bg-[#0b0f19] opacity-80 cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="basicDeatils.gender"
            control={control}
            render={({ field }) => (
              <SearchDropdown
                label="Gender"
                required
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' }
                ]}
                error={errors.basicDeatils?.gender?.message}
              />
            )}
          />

          <Controller
            name="basicDeatils.modelType"
            control={control}
            render={({ field }) => (
              <MultiSelectSearchDropdown
                label="Model Type"
                required
                value={field.value || []}
                onChange={field.onChange}
                options={[
                  { value: 'Beginner', label: 'Beginner' },
                  { value: 'Professional', label: 'Professional' },
                  { value: 'Influencer', label: 'Influencer' }
                ]}
                error={errors.basicDeatils?.modelType?.message}
              />
            )}
          />
        </div>
      </div>

      {/* ── SECTION 3: PHYSICAL CHARACTERISTICS ───────────────────────────────────── */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Physical Characteristics
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Talent appearance description and aesthetic attributes.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Complexion"
            placeholder="e.g. Fair, Dusky"
            error={errors.physicalCharacteristics?.complexion?.message}
            {...register('physicalCharacteristics.complexion')}
          />

          <FormInput
            label="Body Shape"
            placeholder="e.g. Hourglass"
            error={errors.physicalCharacteristics?.bodyShape?.message}
            {...register('physicalCharacteristics.bodyShape')}
          />

          <FormInput
            label="Eye Color"
            placeholder="e.g. Brown"
            error={errors.physicalCharacteristics?.eyeColor?.message}
            {...register('physicalCharacteristics.eyeColor')}
          />

          <FormInput
            label="Hair Color"
            placeholder="e.g. Black"
            error={errors.physicalCharacteristics?.hairColor?.message}
            {...register('physicalCharacteristics.hairColor')}
          />
        </div>
      </div>

      {/* ── SECTION 4: DETAILED MEASUREMENTS ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
            Key Measurements
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Dimensions, sizing, height, and weight values.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 tracking-wider flex items-center gap-0.5">
              Height <span className="text-red-500 font-bold">*</span>
            </span>
            <input type="hidden" {...register('measurements.height')} />
            <div className="flex gap-4">
              <div className="w-1/2 flex items-center gap-2">
                <NumberInput
                  placeholder="Feet"
                  value={heightFeet}
                  maxLength={2}
                  onChange={(val) => {
                    setHeightFeet(val);
                    setValue('measurements.height', `${val || '0'} fit ${heightInches || '0'} inch`, { shouldValidate: true });
                  }}
                />
                <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">fit</span>
              </div>
              <div className="w-1/2 flex items-center gap-2">
                <NumberInput
                  placeholder="Inches"
                  value={heightInches}
                  maxLength={2}
                  onChange={(val) => {
                    setHeightInches(val);
                    setValue('measurements.height', `${heightFeet || '0'} fit ${val || '0'} inch`, { shouldValidate: true });
                  }}
                />
                <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">inch</span>
              </div>
            </div>
            {errors.measurements?.height?.message && (
              <span className="text-xs font-medium text-red-500 mt-0.5">{errors.measurements.height.message}</span>
            )}
          </div>

          <FormInput
            label="Weight (kg)"
            required
            placeholder="Weight (e.g. 60)"
            error={errors.measurements?.weight?.message}
            {...register('measurements.weight', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }
            })}
          />

          <FormInput
            label="Shoulder Width"
            placeholder="Shoulder width (e.g. 42)"
            error={errors.measurements?.shoulder?.message}
            {...register('measurements.shoulder', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }
            })}
          />

          <FormInput
            label="Chest"
            placeholder="e.g. 38"
            error={errors.measurements?.chest?.message}
            {...register('measurements.chest', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }
            })}
          />

          <FormInput
            label="Bust"
            placeholder="e.g. 34"
            error={errors.measurements?.bust?.message}
            {...register('measurements.bust', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }
            })}
          />

          <FormInput
            label="Waist"
            placeholder="e.g. 28"
            error={errors.measurements?.waist?.message}
            {...register('measurements.waist', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }
            })}
          />

          <FormInput
            label="Hips"
            placeholder="e.g. 36"
            error={errors.measurements?.hips?.message}
            {...register('measurements.hips', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }
            })}
          />

          <FormInput
            label="Shoe Size"
            placeholder="e.g. 8"
            error={errors.measurements?.shoe?.message}
            {...register('measurements.shoe', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }
            })}
          />

          <Controller
            name="measurements.size"
            control={control}
            render={({ field }) => (
              <SearchDropdown
                label="Size Chart"
                required
                value={field.value || ''}
                onChange={field.onChange}
                options={[
                  { value: 'XS', label: 'XS' },
                  { value: 'S', label: 'S' },
                  { value: 'M', label: 'M' },
                  { value: 'L', label: 'L' },
                  { value: 'XL', label: 'XL' },
                  { value: 'XXL', label: 'XXL' },
                  { value: 'XXXL', label: 'XXXL' }
                ]}
                error={errors.measurements?.size?.message}
              />
            )}
          />
        </div>
      </div>

      {/* ── SECTION 5: ADDRESS DETAILS ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Address Details
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Regional address information of the model.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Address Line 1"
            required
            placeholder="Street address, company name, P.O. box"
            error={errors.address?.addressLine1?.message}
            {...register('address.addressLine1')}
          />

          <FormInput
            label="Address Line 2"
            placeholder="Apartment, suite, unit, building, floor"
            error={errors.address?.addressLine2?.message}
            {...register('address.addressLine2')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="address.country"
            control={control}
            render={({ field }) => (
              <CountrySingleSelect
                required
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  setValue('address.state', '');
                  setValue('address.city', '');
                }}
                error={errors.address?.country?.message}
                initialLabel={initialValues?.address?.country?.name}
              />
            )}
          />

          <Controller
            name="address.state"
            control={control}
            render={({ field }) => (
              <StateSingleSelect
                required
                countryId={selectedCountry}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  setValue('address.city', '');
                }}
                error={errors.address?.state?.message}
                disabled={!selectedCountry}
                initialLabel={initialValues?.address?.state?.name}
              />
            )}
          />

          <Controller
            name="address.city"
            control={control}
            render={({ field }) => (
              <CitySingleSelect
                required
                stateId={selectedState}
                value={field.value}
                onChange={field.onChange}
                error={errors.address?.city?.message}
                disabled={!selectedState}
                initialLabel={initialValues?.address?.city?.name}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Postal / Zip Code"
            required
            placeholder="e.g. 110001"
            error={errors.address?.postalCode?.message}
            {...register('address.postalCode')}
          />
        </div>
      </div>

      {/* ── SECTION 6: PROFESSIONAL BIO ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-navy-border pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100  tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Biography
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Detailed biography of the model talent.</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-405 tracking-wider flex items-center gap-0.5">
            Professional Bio <span className="text-red-500 font-bold">*</span>
          </label>
          <textarea
            id="bio"
            placeholder="Write a brief professional summary of the model's work, experience and divisions..."
            rows={4}
            className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#0f1422] border rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all ${errors.bio
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
              : 'border-slate-300 dark:border-navy-border focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20'
              }`}
            {...register('bio')}
          />
          {errors.bio?.message && (
            <span className="text-[10px] text-red-500 font-semibold">{errors.bio.message}</span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="px-10 py-3.5 text-xs font-extrabold shadow-md hover:shadow-lg hover:bg-accent-700 hover:scale-[1.01] active:scale-[0.98] transition-all duration-150 rounded-xl"
          isLoading={isPending}
          disabled={!isEdit && !profilePictureFile}
        >
          {isEdit ? 'Save Changes' : 'Add Model'}
        </Button>
      </div>
    </form>
  );
};

export default ModelForm;
