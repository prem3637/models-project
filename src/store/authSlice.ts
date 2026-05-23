import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  name: string;
  email: string;
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
  const saved = localStorage.getItem('rbc_user_role');
  if (saved === 'admin' || saved === 'editor' || saved === 'viewer') {
    return {
      name: saved.charAt(0).toUpperCase() + saved.slice(1) + ' User',
      email: `${saved}@rbc-models.com`
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
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      localStorage.setItem('rbc_user_role', action.payload.role);
      localStorage.setItem('rbc_auth_token', 'authenticated');
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
      state.user = {
        name: action.payload.charAt(0).toUpperCase() + action.payload.slice(1) + ' User',
        email: `${action.payload}@rbc-models.com`
      };
      localStorage.setItem('rbc_user_role', action.payload);
      // Ensure auth token is set when role changes
      if (!localStorage.getItem('rbc_auth_token')) {
        localStorage.setItem('rbc_auth_token', 'authenticated');
      }
    }
  }
});

export const { login, logout, setRole } = authSlice.actions;
export default authSlice.reducer;
