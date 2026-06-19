export interface RBCModel {
  id: string;
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: 'Male' | 'Female' | 'Non-Binary';
  category: 'Fashion' | 'Commercial' | 'Runway' | 'Fitness';
  status: 'Active' | 'Inactive' | 'On-Leave';
  email: string;
  phone: string;
  imageUrl: string;
  images: string[];
  bio: string;
  createdAt: string;
  country: string;
  state: string;
  city: string;
}

export interface FilterParams {
  search?: string;
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  gender?: string;
  status?: string;
  category?: string;
  country?: string;
  state?: string;
  city?: string;
}

const SEED_MODELS: RBCModel[] = [
  {
    id: 'm1',
    name: 'Aria Montgomery',
    age: 23,
    height: 178,
    weight: 56,
    gender: 'Female',
    category: 'Fashion',
    status: 'Active',
    email: 'aria.m@agency.com',
    phone: '+1 (555) 234-5678',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=1000&fit=crop'
    ],
    bio: 'Professional fashion and editorial model with 4+ years of experience working with top luxury brands worldwide.',
    createdAt: '2025-01-15T08:30:00Z',
    country: 'France',
    state: 'Île-de-France',
    city: 'Paris'
  },
  {
    id: 'm2',
    name: 'Marcus Vance',
    age: 27,
    height: 188,
    weight: 78,
    gender: 'Male',
    category: 'Runway',
    status: 'Active',
    email: 'marcus.v@agency.com',
    phone: '+1 (555) 876-5432',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop'
    ],
    bio: 'Runway specialist known for sharp walks and athletic build. Has featured in Paris and Milan fashion weeks.',
    createdAt: '2025-02-10T10:15:00Z',
    country: 'Italy',
    state: 'Lombardy',
    city: 'Milan'
  },
  {
    id: 'm3',
    name: 'Elena Rostova',
    age: 21,
    height: 175,
    weight: 52,
    gender: 'Female',
    category: 'Commercial',
    status: 'Active',
    email: 'elena.r@agency.com',
    phone: '+1 (555) 345-6789',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop'
    ],
    bio: 'Vibrant commercial face with a passion for skincare and lifestyle campaigns. Camera-friendly smile.',
    createdAt: '2025-03-05T14:45:00Z',
    country: 'United Kingdom',
    state: 'England',
    city: 'London'
  },
  {
    id: 'm4',
    name: 'Jordan Kross',
    age: 25,
    height: 182,
    weight: 70,
    gender: 'Non-Binary',
    category: 'Fashion',
    status: 'Active',
    email: 'jordan.k@agency.com',
    phone: '+1 (555) 987-6543',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop'
    ],
    bio: 'Androgynous high-fashion model pushing boundaries. Active in experimental concepts and artistic print layouts.',
    createdAt: '2025-03-12T11:00:00Z',
    country: 'United States',
    state: 'New York',
    city: 'New York'
  },
  {
    id: 'm5',
    name: 'Christian Bale',
    age: 30,
    height: 185,
    weight: 82,
    gender: 'Male',
    category: 'Fitness',
    status: 'Inactive',
    email: 'christian.b@agency.com',
    phone: '+1 (555) 456-7890',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop'
    ],
    bio: 'Athletic fitness model. Specializes in activewear advertising, gym sponsorships, and high-intensity sports promos.',
    createdAt: '2025-01-20T09:00:00Z',
    country: 'United States',
    state: 'California',
    city: 'Los Angeles'
  },
  {
    id: 'm6',
    name: 'Serena Williams',
    age: 26,
    height: 180,
    weight: 64,
    gender: 'Female',
    category: 'Fitness',
    status: 'On-Leave',
    email: 'serena.w@agency.com',
    phone: '+1 (555) 765-4321',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop'
    ],
    bio: 'Dual fitness and runway model. On temporary leave for international shooting, returning in Q3.',
    createdAt: '2025-02-28T16:20:00Z',
    country: 'United Kingdom',
    state: 'England',
    city: 'London'
  },
  {
    id: 'm7',
    name: 'Lucas Thorne',
    age: 22,
    height: 190,
    weight: 80,
    gender: 'Male',
    category: 'Runway',
    status: 'Active',
    email: 'lucas.t@agency.com',
    phone: '+1 (555) 567-8901',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop'
    ],
    bio: 'Rising runway star. Tall build, structured cheekbones, and high-fashion versatility.',
    createdAt: '2025-04-02T13:10:00Z',
    country: 'France',
    state: 'Île-de-France',
    city: 'Paris'
  },
  {
    id: 'm8',
    name: 'Naomi Campbell',
    age: 24,
    height: 177,
    weight: 54,
    gender: 'Female',
    category: 'Runway',
    status: 'Active',
    email: 'naomi.c@agency.com',
    phone: '+1 (555) 890-1234',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop'
    ],
    bio: 'Stunning editorial look, specializes in haute couture runway and premium jewelry advertisements.',
    createdAt: '2025-04-10T15:30:00Z',
    country: 'United Kingdom',
    state: 'England',
    city: 'London'
  },
  {
    id: 'm9',
    name: 'Priyanka Sharma',
    age: 24,
    height: 172,
    weight: 54,
    gender: 'Female',
    category: 'Fashion',
    status: 'Active',
    email: 'priyanka.s@agency.com',
    phone: '+91 98765 43210',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop'
    ],
    bio: 'Professional fashion model from India. Has walked for leading domestic fashion designers.',
    createdAt: '2025-04-12T09:30:00Z',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Varanasi'
  },
  {
    id: 'm10',
    name: 'Amit Patel',
    age: 26,
    height: 182,
    weight: 74,
    gender: 'Male',
    category: 'Commercial',
    status: 'Active',
    email: 'amit.p@agency.com',
    phone: '+91 87654 32109',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop'
    ],
    bio: 'Charismatic commercial actor and model based in Lucknow. Known for corporate print campaigns.',
    createdAt: '2025-04-15T11:00:00Z',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Lucknow'
  },
  {
    id: 'm11',
    name: 'Rohan Deshmukh',
    age: 28,
    height: 186,
    weight: 79,
    gender: 'Male',
    category: 'Runway',
    status: 'Active',
    email: 'rohan.d@agency.com',
    phone: '+91 76543 21098',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop'
    ],
    bio: 'High-fashion runway specialist based in Mumbai. Has walked for Lakme Fashion Week.',
    createdAt: '2025-04-20T14:15:00Z',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai'
  },
  {
    id: 'm12',
    name: 'Harpreet Singh',
    age: 25,
    height: 184,
    weight: 76,
    gender: 'Male',
    category: 'Runway',
    status: 'Active',
    email: 'harpreet.s@agency.com',
    phone: '+91 99887 76655',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop'
    ],
    bio: 'Elegant runway model from Amritsar, Punjab. Celebrated for strong presence in ethnic and modern menswear.',
    createdAt: '2025-04-22T10:00:00Z',
    country: 'India',
    state: 'Punjab',
    city: 'Amritsar'
  },
  {
    id: 'm13',
    name: 'Hans Müller',
    age: 29,
    height: 187,
    weight: 81,
    gender: 'Male',
    category: 'Commercial',
    status: 'Active',
    email: 'hans.m@agency.com',
    phone: '+49 89 123456',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop'
    ],
    bio: 'Bavarian commercial model based in Munich. Specializes in luxury automotive and watch ads.',
    createdAt: '2025-04-24T12:00:00Z',
    country: 'Germany',
    state: 'Bavaria',
    city: 'Munich'
  },
  {
    id: 'm14',
    name: 'Yuki Tanaka',
    age: 23,
    height: 174,
    weight: 53,
    gender: 'Female',
    category: 'Fashion',
    status: 'Active',
    email: 'yuki.t@agency.com',
    phone: '+81 90 1234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop'
    ],
    bio: 'Tokyo-based fashion and print model. Known for avant-garde styling and street fashion campaigns.',
    createdAt: '2025-04-26T15:30:00Z',
    country: 'Japan',
    state: 'Tokyo',
    city: 'Tokyo'
  },
  {
    id: 'm15',
    name: 'Isabella Santos',
    age: 25,
    height: 176,
    weight: 56,
    gender: 'Female',
    category: 'Runway',
    status: 'Active',
    email: 'isabella.s@agency.com',
    phone: '+55 21 98765-4321',
    imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop'
    ],
    bio: 'Vibrant runway model from Rio de Janeiro. High energy walkthroughs, has shot with prominent beachwear brands.',
    createdAt: '2025-04-28T09:00:00Z',
    country: 'Brazil',
    state: 'Rio de Janeiro',
    city: 'Rio de Janeiro'
  }
];

const LOCAL_STORAGE_KEY = 'rbc_models_db';

const initializeDb = (): RBCModel[] => {
  const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_MODELS));
    return SEED_MODELS;
  }
  try {
    const parsed = JSON.parse(existing) as RBCModel[];
    let migrated = false;
    const updated = parsed.map(m => {
      let changed = false;
      const mUpdated = { ...m };
      if (!mUpdated.images || !Array.isArray(mUpdated.images) || mUpdated.images.length <= 1) {
        const correspondingSeed = SEED_MODELS.find(s => s.id === mUpdated.id);
        if (correspondingSeed) {
          mUpdated.images = correspondingSeed.images;
        } else {
          mUpdated.images = mUpdated.imageUrl ? [mUpdated.imageUrl] : [SEED_MODELS[0].imageUrl];
        }
        changed = true;
      }
      if (!mUpdated.country) {
        mUpdated.country = 'United States';
        changed = true;
      }
      if (!mUpdated.state) {
        mUpdated.state = mUpdated.country === 'United States' ? 'New York' : 'Île-de-France';
        changed = true;
      }
      if (!mUpdated.city) {
        mUpdated.city = 'New York';
        changed = true;
      }
      if (changed) migrated = true;
      return mUpdated;
    });

    // Only add missing seed models if the database is completely empty (first initialization)
    // Don't re-add deleted seed models - respect user deletions
    if (updated.length === 0) {
      updated.push(...SEED_MODELS);
      migrated = true;
    } else {
      // Force-update images for existing seed models with incomplete images
      SEED_MODELS.forEach(seed => {
        const idx = updated.findIndex(m => m.id === seed.id);
        if (idx !== -1 && updated[idx].images.length <= 1) {
          updated[idx].images = seed.images;
          migrated = true;
        }
      });
    }

    if (migrated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  } catch {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_MODELS));
    return SEED_MODELS;
  }
};

export const mockDb = {
  getAll: (filters: FilterParams = {}): RBCModel[] => {
    let models = initializeDb();

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      models = models.filter(
        m =>
          (m.name || '').toLowerCase().includes(searchLower) ||
          (m.email || '').toLowerCase().includes(searchLower)
      );
    }

    if (filters.minAge !== undefined) {
      models = models.filter(m => m.age >= filters.minAge!);
    }
    if (filters.maxAge !== undefined) {
      models = models.filter(m => m.age <= filters.maxAge!);
    }

    if (filters.minHeight !== undefined) {
      models = models.filter(m => m.height >= filters.minHeight!);
    }
    if (filters.maxHeight !== undefined) {
      models = models.filter(m => m.height <= filters.maxHeight!);
    }

    if (filters.gender) {
      models = models.filter(m => m.gender === filters.gender);
    }

    if (filters.status) {
      models = models.filter(m => m.status === filters.status);
    }

    if (filters.category) {
      models = models.filter(m => m.category === filters.category);
    }

    if (filters.country) {
      models = models.filter(m => m.country === filters.country);
    }

    if (filters.state) {
      models = models.filter(m => m.state === filters.state);
    }

    if (filters.city) {
      models = models.filter(m => m.city === filters.city);
    }

    return models.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: (id: string): RBCModel | undefined => {
    const models = initializeDb();
    return models.find(m => m.id === id);
  },

  create: (data: Omit<RBCModel, 'id' | 'createdAt'>): RBCModel => {
    const models = initializeDb();
    const newModel: RBCModel = {
      ...data,
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    models.push(newModel);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(models));
    return newModel;
  },

  update: (id: string, data: Partial<Omit<RBCModel, 'id' | 'createdAt'>>): RBCModel => {
    const models = initializeDb();
    const index = models.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Model with id ${id} not found`);
    }
    const updatedModel = {
      ...models[index],
      ...data
    };
    models[index] = updatedModel;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(models));
    return updatedModel;
  },

  delete: (id: string): void => {
    let models = initializeDb();
    models = models.filter(m => m.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(models));
  }
};
