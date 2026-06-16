import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  name: string;
  email: string;
  title?: string;
  phone?: string;
  bio?: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AuthState {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
}

const getInitialRole = (): UserRole => {
  const saved = localStorage.getItem('rbc_user_role');
  if (saved === 'admin' || saved === 'editor' || saved === 'viewer') {
    return saved;
  }
  return 'viewer';
};

const getInitialUser = (): User | null => {
  const savedRole = localStorage.getItem('rbc_user_role');
  if (savedRole === 'admin' || savedRole === 'editor' || savedRole === 'viewer') {
    const savedProfile = localStorage.getItem(`rbc_profile_${savedRole}`);
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch {
        // Fallback to defaults
      }
    }
    return {
      name: savedRole.charAt(0).toUpperCase() + savedRole.slice(1) + ' User',
      email: `${savedRole}@rbc-models.com`,
      title: savedRole === 'admin' ? 'Agency Director' : savedRole === 'editor' ? 'Lead Booker' : 'Talent Observer',
      phone: '+1 (555) 019-2834',
      bio: savedRole === 'admin'
        ? 'Lead bookings and roster strategy at RBC Models.'
        : 'Coordinates model booking schedules and roster management.',
    };
  }
  return null;
};

const getInitialAuthState = (): AuthState => {
  const savedRole = localStorage.getItem('rbc_user_role');
  const authToken = localStorage.getItem('rbc_auth_token');
  const isAuthenticated = authToken === 'authenticated' && (savedRole === 'admin' || savedRole === 'editor' || savedRole === 'viewer');
  
  return {
    user: isAuthenticated ? getInitialUser() : null,
    role: isAuthenticated ? getInitialRole() : 'viewer',
    isAuthenticated
  };
};

const initialState: AuthState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; role: UserRole }>) => {
      // Inject fallback details for full user compatibility
      const baseUser = {
        title: action.payload.role === 'admin' ? 'Agency Director' : action.payload.role === 'editor' ? 'Lead Booker' : 'Talent Observer',
        phone: '+1 (555) 019-2834',
        bio: action.payload.role === 'admin'
          ? 'Lead bookings and roster strategy at RBC Models.'
          : 'Coordinates model booking schedules and roster management.',
        ...action.payload.user
      };
      state.user = baseUser;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      localStorage.setItem('rbc_user_role', action.payload.role);
      localStorage.setItem('rbc_auth_token', 'authenticated');
      localStorage.setItem(`rbc_profile_${action.payload.role}`, JSON.stringify(baseUser));
    },
    logout: (state) => {
      state.user = null;
      state.role = 'viewer';
      state.isAuthenticated = false;
      localStorage.removeItem('rbc_user_role');
      localStorage.removeItem('rbc_auth_token');
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
      localStorage.setItem('rbc_user_role', action.payload);
      
      const savedProfile = localStorage.getItem(`rbc_profile_${action.payload}`);
      if (savedProfile) {
        try {
          state.user = JSON.parse(savedProfile);
        } catch {
          // Fallback
        }
      } else {
        state.user = {
          name: action.payload.charAt(0).toUpperCase() + action.payload.slice(1) + ' User',
          email: `${action.payload}@rbc-models.com`,
          title: action.payload === 'admin' ? 'Agency Director' : action.payload === 'editor' ? 'Lead Booker' : 'Talent Observer',
          phone: '+1 (555) 019-2834',
          bio: action.payload === 'admin'
            ? 'Lead bookings and roster strategy at RBC Models.'
            : 'Coordinates model booking schedules and roster management.',
        };
        localStorage.setItem(`rbc_profile_${action.payload}`, JSON.stringify(state.user));
      }
      
      // Ensure auth token is set when role changes
      if (!localStorage.getItem('rbc_auth_token')) {
        localStorage.setItem('rbc_auth_token', 'authenticated');
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        };
        localStorage.setItem(`rbc_profile_${state.role}`, JSON.stringify(state.user));
      }
    }
  }
});

export const { login, logout, setRole, updateProfile } = authSlice.actions;
export default authSlice.reducer;
