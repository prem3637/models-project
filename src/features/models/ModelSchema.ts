import { z } from 'zod';

export const ModelFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  age: z.number()
    .min(18, 'Model must be at least 18 years old')
    .max(80, 'Model age must not exceed 80 years'),
  height: z.number()
    .min(120, 'Height must be at least 120 cm')
    .max(230, 'Height must not exceed 230 cm'),
  weight: z.number()
    .min(35, 'Weight must be at least 35 kg')
    .max(150, 'Weight must not exceed 150 kg'),
  gender: z.enum(['Male', 'Female', 'Non-Binary']),
  category: z.enum(['Fashion', 'Commercial', 'Runway', 'Fitness']),
  status: z.enum(['Active', 'Inactive', 'On-Leave']),
  email: z.string()
    .email('Please enter a valid email address'),
  phone: z.string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number must not exceed 20 digits'),
  imageUrl: z.string()
    .url('Please select or input a valid image URL')
    .or(z.string().min(1, 'Image URL is required')),
  images: z.array(z.string().url('Each image must be a valid URL'))
    .min(1, 'Please select or add at least one portfolio image'),
  bio: z.string()
    .max(500, 'Bio must not exceed 500 characters'),
  country: z.string()
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country name must not exceed 50 characters'),
  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State name must not exceed 50 characters'),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City name must not exceed 50 characters')
});

export type ModelFormData = z.infer<typeof ModelFormSchema>;
