import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AUTH_KEY } from "../api-tags";
import { authApi } from "../services/auth";
import { modelsApi } from "../services";
import type { RootState } from "../reducer";
import { IUser } from "../../interface/user";

interface AuthSliceState {
    user: IUser | null;
    token: string;
    isLoggedIn: boolean;
}

const initialState: AuthSliceState = {
    user: null,
    token: "",
    isLoggedIn: false,
};

export const authSlice = createSlice({
    name: AUTH_KEY,
    initialState,
    reducers: {
        setAccessToken: (state, { payload }) => {
            state.token = payload;
        },
        logout: (state) => {
            modelsApi.util.resetApiState();
            state.user = null;
            state.token = "";
            state.isLoggedIn = false;
        },
        updateProfileLocal: (state, action: PayloadAction<Partial<IUser>>) => {
            if (state.user) {
                state.user = {
                    ...state.user,
                    ...action.payload,
                };
            }
        }
    },

    extraReducers: (builder) => {
        builder.addMatcher(
            authApi.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                if (payload?.token) {
                    state.token = payload.token;
                } else {
                    state.user = null;
                    state.token = "";
                    state.isLoggedIn = false;
                }
            },
        );
        builder.addMatcher(
            authApi.endpoints.currentUserData.matchFulfilled,
            (state, { payload }) => {
                if (!payload) return;
                state.user = payload;
                state.isLoggedIn = true;
            },
        );
        builder.addMatcher(
            authApi.endpoints.login.matchRejected,
            (state, { payload }) => {
                console.log(`Login failed`, payload);
            },
        );
        builder.addMatcher(
            authApi.endpoints.currentUserData.matchRejected,
            (state, { payload }) => {
                console.log(`Fetch current user failed`, payload);
            },
        );
    },
});

export default authSlice.reducer;
export const { setAccessToken, logout, updateProfileLocal } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectRole = (state: RootState) => state.auth.user?.role?.name || "";
export const selectToken = (state: RootState) => state.auth.token;

