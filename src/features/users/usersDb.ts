export type SystemRole = 'admin' | 'editor' | 'viewer';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  department: string;
  status: 'Active' | 'Suspended';
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
}

const USERS_KEY = 'rbc_users_db';

const SEED_USERS: SystemUser[] = [
  {
    id: 'u1',
    name: 'Alexandra Reid',
    email: 'admin@rbc-models.com',
    role: 'admin',
    department: 'Management',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-11-01T08:00:00Z',
    lastLogin: '2025-05-20T09:15:00Z'
  },
  {
    id: 'u2',
    name: 'Marcus Steinberg',
    email: 'editor@rbc-models.com',
    role: 'editor',
    department: 'Talent Relations',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-11-15T10:30:00Z',
    lastLogin: '2025-05-19T14:45:00Z'
  },
  {
    id: 'u3',
    name: 'Priya Sharma',
    email: 'viewer@rbc-models.com',
    role: 'viewer',
    department: 'Casting',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    createdAt: '2025-01-10T09:00:00Z',
    lastLogin: '2025-05-18T11:00:00Z'
  },
  {
    id: 'u4',
    name: 'James Harlow',
    email: 'james.h@rbc-models.com',
    role: 'editor',
    department: 'Photography',
    status: 'Suspended',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    createdAt: '2025-02-05T11:15:00Z',
    lastLogin: '2025-04-01T08:30:00Z'
  },
  {
    id: 'u5',
    name: 'Sophia Laurent',
    email: 'sophia.l@rbc-models.com',
    role: 'viewer',
    department: 'Marketing',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face',
    createdAt: '2025-03-20T13:45:00Z',
    lastLogin: '2025-05-20T07:00:00Z'
  },
  {
    id: 'u6',
    name: 'Vikram Singh',
    email: 'vikram.s@rbc-models.com',
    role: 'editor',
    department: 'Talent Relations',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    createdAt: '2025-04-10T12:00:00Z',
    lastLogin: '2025-05-19T10:00:00Z'
  },
  {
    id: 'u7',
    name: 'Emma Watson',
    email: 'emma.w@rbc-models.com',
    role: 'viewer',
    department: 'Casting',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    createdAt: '2025-04-15T14:30:00Z',
    lastLogin: '2025-05-20T08:00:00Z'
  },
  {
    id: 'u8',
    name: 'Kabir Mehta',
    email: 'kabir.m@rbc-models.com',
    role: 'admin',
    department: 'Management',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
    createdAt: '2025-04-20T16:00:00Z',
    lastLogin: '2025-05-20T11:00:00Z'
  }
];

const initUsersDb = (): SystemUser[] => {
  const existing = localStorage.getItem(USERS_KEY);
  if (!existing) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  try {
    let parsed = JSON.parse(existing) as SystemUser[];
    let migrated = false;

    // Only add missing seed users if the database is completely empty (first initialization)
    // Don't re-add deleted seed users - respect user deletions
    if (parsed.length === 0) {
      parsed = [...SEED_USERS];
      migrated = true;
    }

    const updated = parsed.map(u => {
      let changed = false;
      const uUpdated = { ...u };
      if (!uUpdated.role || !['admin', 'editor', 'viewer'].includes(uUpdated.role)) {
        uUpdated.role = 'viewer';
        changed = true;
      }
      if (!uUpdated.status || !['Active', 'Suspended'].includes(uUpdated.status)) {
        uUpdated.status = 'Active';
        changed = true;
      }
      if (!uUpdated.name) {
        uUpdated.name = 'Legacy User';
        changed = true;
      }
      if (!uUpdated.email) {
        uUpdated.email = 'legacy@rbc-models.com';
        changed = true;
      }
      if (!uUpdated.department) {
        uUpdated.department = 'General';
        changed = true;
      }
      if (changed) migrated = true;
      return uUpdated;
    });
    if (migrated) {
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    }
    return updated;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
};

const save = (users: SystemUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const usersDb = {
  getAll: (): SystemUser[] => {
    return initUsersDb().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById: (id: string): SystemUser | undefined => {
    return initUsersDb().find(u => u.id === id);
  },

  create: (data: Omit<SystemUser, 'id' | 'createdAt'>): SystemUser => {
    const users = initUsersDb();
    const newUser: SystemUser = {
      ...data,
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    save(users);
    return newUser;
  },

  update: (id: string, data: Partial<Omit<SystemUser, 'id' | 'createdAt'>>): SystemUser => {
    const users = initUsersDb();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error(`User ${id} not found`);
    users[idx] = { ...users[idx], ...data };
    save(users);
    return users[idx];
  },

  delete: (id: string): void => {
    const users = initUsersDb().filter(u => u.id !== id);
    save(users);
  }
};
