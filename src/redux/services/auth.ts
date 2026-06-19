
import { TAG_CURRENT_USER } from "../api-tags";
import { modelsApi } from ".";
import { IUser, LoginRequest } from "../../interface/user";

export const authApi = modelsApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        currentUserData: builder.query<IUser, void>({
            providesTags: [{ type: TAG_CURRENT_USER, id: "currentUsers" }],
            query: () => {
                return {
                    url: "/auth/me",
                    method: "get",
                };
            },
            transformResponse: (response: any) => response.data,
        }),

        register: builder.mutation<any, any>({
            query: (body) => ({
                url: "/auth/register",
                method: "POST",
                body,
            }),
        }),

        login: builder.mutation<IUser, LoginRequest>({
            invalidatesTags: [{ type: TAG_CURRENT_USER, id: "currentUsers" }],
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
            }),
            transformResponse: (response: any) => response.data,
        }),

        updateProfile: builder.mutation<any, any>({
            invalidatesTags: [{ type: TAG_CURRENT_USER, id: "currentUsers" }],
            query: (body) => ({
                url: "/auth/me",
                method: "PATCH",
                body,
            }),
            transformResponse: (response: any) => response.data,
        }),
        forgotPassword: builder.mutation<void, { email: string }>({
            query: (body) => ({
                url: "/auth/forgot/password",
                method: "POST",
                body,
            }),
        }),
        resetPassword: builder.mutation<void, { hash: string; password: string }>({
            query: (body) => ({
                url: "/auth/reset/password",
                method: "POST",
                body,
            }),
        }),
        updateUserPassword: builder.mutation<void, any>({
            query: ({ userId, ...body }) => ({
                url: `/users/${userId}/update/password`,
                method: "PATCH",
                body,
            }),
        }),
    }),
});

export const {
    useCurrentUserDataQuery,
    useRegisterMutation,
    useLoginMutation,
    useUpdateProfileMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useUpdateUserPasswordMutation,
} = authApi;
