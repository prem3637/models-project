import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModelFormSchema, ModelFormData } from '../ModelSchema';
import { useCreateModel, useUpdateModel, useWorldCities } from '../modelsHooks';
import FormInput from '../../../components/ui/FormInput';
import SearchDropdown from '../../../components/ui/SearchDropdown';
import Button from '../../../components/ui/Button';

const SUGGESTED_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&h=600&fit=crop',
];

interface ModelFormProps {
  modelId?: string;
  initialValues?: Partial<ModelFormData>;
  onSuccess: () => void;
}

export const ModelForm: React.FC<ModelFormProps> = ({ modelId, initialValues, onSuccess }) => {
  const createMutation = useCreateModel();
  const updateMutation = useUpdateModel();
  const isEdit = !!modelId;

  // Let react-hook-form handle the fields
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ModelFormData>({
    resolver: zodResolver(ModelFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      age: initialValues?.age || 20,
      height: initialValues?.height || 175,
      weight: initialValues?.weight || 60,
      gender: initialValues?.gender || 'Female',
      category: initialValues?.category || 'Fashion',
      status: initialValues?.status || 'Active',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      imageUrl: initialValues?.imageUrl || SUGGESTED_IMAGES[0],
      images: initialValues?.images || [SUGGESTED_IMAGES[0]],
      bio: initialValues?.bio || '',
      country: initialValues?.country || '',
      state: initialValues?.state || '',
      city: initialValues?.city || ''
    }
  });

  const selectedImages = watch('images') || [];

  const { data: worldCities = [], isLoading: isCitiesLoading } = useWorldCities();

  const countries = React.useMemo(() => {
    return Array.from(new Set(worldCities.map(c => c.country))).sort();
  }, [worldCities]);

  const selectedCountry = watch('country');

  const states = React.useMemo(() => {
    if (!selectedCountry) return [];
    return Array.from(
      new Set(worldCities.filter(c => c.country === selectedCountry && c.subcountry).map(c => c.subcountry))
    ).sort();
  }, [worldCities, selectedCountry]);

  const selectedState = watch('state');

  const filteredCities = React.useMemo(() => {
    if (!selectedCountry || !selectedState) return [];
    return Array.from(
      new Set(worldCities.filter(c => c.country === selectedCountry && c.subcountry === selectedState).map(c => c.name))
    ).sort();
  }, [worldCities, selectedCountry, selectedState]);

  const handleToggleImage = (url: string) => {
    const nextImages = selectedImages.includes(url)
      ? selectedImages.filter(x => x !== url)
      : [...selectedImages, url];
      
    setValue('images', nextImages, { shouldValidate: true });
    
    // Auto-select the first one as imageUrl
    if (nextImages.length > 0) {
      setValue('imageUrl', nextImages[0], { shouldValidate: true });
    } else {
      setValue('imageUrl', '', { shouldValidate: true });
    }
  };

  const onSubmit = (data: ModelFormData) => {
    if (isEdit && modelId) {
      updateMutation.mutate(
        { id: modelId, data },
        {
          onSuccess: () => {
            onSuccess();
          }
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onSuccess();
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-left pb-10">
      {/* Portfolio Selection */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Portfolio Gallery Selection
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Select one or more images. The first selected image will be used as the primary avatar.</span>
        </div>

        <div className="grid grid-cols-5 gap-2 mt-1">
          {SUGGESTED_IMAGES.map((url, idx) => {
            const isSelected = selectedImages.includes(url);
            const orderIndex = selectedImages.indexOf(url);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleToggleImage(url)}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-accent-600 ring-2 ring-accent-500/20 scale-[0.97] shadow-sm'
                    : 'border-slate-200 dark:border-navy-border hover:border-slate-350 dark:hover:border-slate-700'
                }`}
              >
                <img src={url} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                
                {/* Check Badge / Number indicator */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-accent-600 border border-white text-[10px] font-bold text-white flex items-center justify-center shadow-md">
                    {orderIndex + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.images && (
          <span className="text-xs font-medium text-red-500 mt-0.5">{errors.images.message}</span>
        )}
      </div>

      <FormInput
        label="Full Name"
        id="name"
        placeholder="Enter model's name"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="Age"
          id="age"
          type="number"
          placeholder="21"
          error={errors.age?.message}
          {...register('age', { valueAsNumber: true })}
        />

        <FormInput
          label="Height (cm)"
          id="height"
          type="number"
          placeholder="178"
          error={errors.height?.message}
          {...register('height', { valueAsNumber: true })}
        />

        <FormInput
          label="Weight (kg)"
          id="weight"
          type="number"
          placeholder="58"
          error={errors.weight?.message}
          {...register('weight', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <SearchDropdown
              label="Gender"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Non-Binary', label: 'Non-Binary' }
              ]}
              error={errors.gender?.message}
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <SearchDropdown
              label="Category"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'Fashion', label: 'Fashion' },
                { value: 'Commercial', label: 'Commercial' },
                { value: 'Runway', label: 'Runway' },
                { value: 'Fitness', label: 'Fitness' }
              ]}
              error={errors.category?.message}
            />
          )}
        />
      </div>

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <SearchDropdown
            label="Booking Status"
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'Active', label: 'Active (Available)' },
              { value: 'Inactive', label: 'Inactive (Unavailable)' },
              { value: 'On-Leave', label: 'On-Leave (Break)' }
            ]}
            error={errors.status?.message}
          />
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Email Address"
          id="email"
          type="email"
          placeholder="talent@agency.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <FormInput
          label="Contact Number"
          id="phone"
          placeholder="+1 (555) 123-4567"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <SearchDropdown
              label="Country"
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                setValue('state', '');
                setValue('city', '');
              }}
              options={countries.map(c => ({ value: c, label: c }))}
              placeholder={isCitiesLoading ? 'Loading countries...' : 'Select Country'}
              error={errors.country?.message}
            />
          )}
        />

        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <SearchDropdown
              label="State"
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                setValue('city', '');
              }}
              options={states.map(s => ({ value: s, label: s }))}
              placeholder={isCitiesLoading ? 'Loading states...' : 'Select State'}
              error={errors.state?.message}
              className={!selectedCountry ? 'opacity-65 pointer-events-none' : ''}
            />
          )}
        />

        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <SearchDropdown
              label="City"
              value={field.value}
              onChange={field.onChange}
              options={filteredCities.map(c => ({ value: c, label: c }))}
              placeholder={isCitiesLoading ? 'Loading cities...' : 'Select City'}
              error={errors.city?.message}
              className={!selectedState ? 'opacity-65 pointer-events-none' : ''}
            />
          )}
        />
      </div>

      <div className="w-full flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Bio / Cover Note
        </label>
        <textarea
          id="bio"
          rows={3}
          placeholder="Write a brief model profile introduction..."
          className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#0f1422] border ${
            errors.bio
              ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
              : 'border-slate-300 dark:border-navy-border focus:ring-accent-500/25 focus:border-accent-500'
          } rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none focus:ring-4 text-xs font-medium`}
          {...register('bio')}
        />
        {errors.bio && (
          <span className="text-xs font-medium text-red-500 mt-0.5">{errors.bio.message}</span>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-navy-border/50 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onSuccess}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isPending}
        >
          {isEdit ? 'Save Changes' : 'Create Model'}
        </Button>
      </div>
    </form>
  );
};

export default ModelForm;
