import { z } from 'zod';

const isValidHeightFeetInches = (heightStr: string): boolean => {
  const clean = heightStr.toLowerCase().trim();

  if (clean.includes('.')) {
    const parts = clean.split('.');
    const ft = parseInt(parts[0], 10);
    const inc = parseInt(parts[1], 10) || 0;
    return ft >= 0 && ft <= 10 && inc >= 0 && inc <= 11;
  }

  const match = clean.match(/^(\d+)\s*(?:fit|feet|ft|')?\s*(\d+)?\s*(?:inch|inches|in|")?$/);
  if (match) {
    const feet = parseInt(match[1], 10);
    const inches = match[2] ? parseInt(match[2], 10) : 0;
    return feet >= 0 && feet <= 10 && inches >= 0 && inches <= 11;
  }

  const num = parseFloat(clean);
  if (!isNaN(num) && num >= 0 && num <= 305) {
    return true;
  }

  return false;
};

export const ModelFormSchema = z.object({
  basicDeatils: z.object({
    fullName: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters'),
    email: z.string()
      .email('Please enter a valid email address'),
    primartContact: z.object({
      code: z.string().min(1, 'Country code is required'),
      number: z.string().min(7, 'Phone number must be at least 7 digits').max(20, 'Phone number must not exceed 20 digits'),
    }),
    secondryContact: z.object({
      code: z.string().optional(),
      number: z.string().optional(),
    }).optional(),
    age: z.number().optional(),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['Male', 'Female', 'Other']),
    modelType: z.array(z.string()).min(1, 'At least one model type is required'),
  }),
  physicalCharacteristics: z.object({
    complexion: z.string().optional(),
    bodyShape: z.string().optional(),
    eyeColor: z.string().optional(),
    hairColor: z.string().optional(),
  }),
  measurements: z.object({
    height: z.string()
      .min(2, 'Height must be specified')
      .refine(val => isValidHeightFeetInches(val), 'Feet must be between 0-10 and Inches between 0-11'),
    weight: z.string().min(2, 'Weight must be specified'),
    bust: z.string().optional(),
    waist: z.string().optional(),
    hips: z.string().optional(),
    shoe: z.string().optional(),
    chest: z.string().optional(),
    shoulder: z.string().optional(),
    size: z.string().min(1, 'Size is required'),
  }),
  address: z.object({
    addressLine1: z.string().min(2, 'Address Line 1 must be specified'),
    addressLine2: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    state: z.string().min(1, 'State is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(2, 'Postal code is required'),
  }),
  bio: z.string()
    .min(10, 'Bio must be at least 10 characters')
    .max(1000, 'Bio must not exceed 1000 characters'),
  files: z.array(z.any()).optional(),
  profilePicture: z.any().optional(),
});

export type ModelFormData = z.infer<typeof ModelFormSchema>;
