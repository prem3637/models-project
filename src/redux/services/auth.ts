
import { TAG_CURRENT_USER } from "../api-tags";
import { modelsApi } from ".";
import { CreateUserRequest, IUser, LoginRequest, UserDetailResponse } from "../../interface/user";

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
            transformResponse: (response: UserDetailResponse) => response.data,
        }),

        login: builder.mutation<IUser, LoginRequest>({
            invalidatesTags: [{ type: TAG_CURRENT_USER, id: "currentUsers" }],
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
            }),
            transformResponse: (response: UserDetailResponse) => response.data,
        }),

        updateProfile: builder.mutation<IUser, Partial<CreateUserRequest>>({
            invalidatesTags: [{ type: TAG_CURRENT_USER, id: "currentUsers" }],
            query: (body) => ({
                url: "/auth/me",
                method: "PUT",
                body,
            }),
            transformResponse: (response: UserDetailResponse) => response.data,
        }),

        uploadProfilePicture: builder.mutation<IUser, { file?: File; remove?: boolean }>({
            invalidatesTags: [{ type: TAG_CURRENT_USER, id: "currentUsers" }],
            query: ({ file, remove }) => {
                const formData = new FormData();
                if (file) {
                    formData.append("file", file);
                }
                if (remove) {
                    formData.append("remove", "true");
                }
                return {
                    url: "/auth/me/profile-picture",
                    method: "PATCH",
                    body: formData,
                };
            },
            transformResponse: (response: UserDetailResponse) => response.data,
        }),
    }),
});

export const {
    useCurrentUserDataQuery,
    useLoginMutation,
    useUpdateProfileMutation,
    useUploadProfilePictureMutation,
} = authApi;
