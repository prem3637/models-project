import { modelsApi } from ".";
import { PaginationQuery } from "../../interface/common";
import { PermissionMatrixResponse } from "../../interface/role";
import { CreateUserRequest, UpdateUserRequest, UserDetailResponse, UserListResponse } from "../../interface/user";
import { usersAdapter, usersInitialState } from "../adapter/users";
import { TAG_USERS } from "../api-tags";


export const usersApi = modelsApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        addUsers: builder.mutation<UserDetailResponse, CreateUserRequest>({
            invalidatesTags: [
                { type: TAG_USERS, id: "LIST" },
            ],
            query: (body) => ({
                url: "/users",
                method: "POST",
                body,
            }),
        }),
        getUsers: builder.query<typeof usersInitialState, PaginationQuery>({
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: TAG_USERS as "Users", id })),
                        { type: TAG_USERS as "Users", id: "LIST" },
                    ]
                    : [{ type: TAG_USERS as "Users", id: "LIST" }],
            query: (params) => ({
                url: `/users`,
                method: "GET",
                params: {
                    page: params.page,
                    limit: params.limit,
                    orderBy: params.orderBy,
                    order: params.order,
                    status: params.status,
                    search: params.search,
                },
            }),
            transformResponse: (response: UserListResponse) => {
                return usersAdapter.setAll(
                    {
                        ...usersInitialState,
                        meta: response?.meta || null,
                    },
                    response.data,
                );
            },
        }),
        getUserDetails: builder.query<UserDetailResponse, string>({
            providesTags: (result, error, id) => [
                { type: TAG_USERS, id },
                { type: TAG_USERS, id: "Details" },
            ],
            query: (id) => ({
                url: `/users/${id}`,
                method: "GET",
            }),
        }),
        updateUser: builder.mutation<UserDetailResponse, UpdateUserRequest>({
            invalidatesTags: [
                { type: TAG_USERS, id: "LIST" },
                { type: TAG_USERS, id: "Details" },
            ],
            query: ({ id, ...body }) => ({
                url: `/users/${id}`,
                method: "PUT",
                body,
            }),
        }),
        deleteUser: builder.mutation<void, string>({
            invalidatesTags: [
                { type: TAG_USERS, id: "LIST" },
                { type: TAG_USERS, id: "DELETED_LIST" },
            ],
            query: (id) => ({
                url: `/users/${id}`,
                method: "DELETE",
            }),
        }),
        permanentDeleteUser: builder.mutation<void, string>({
            invalidatesTags: [
                { type: TAG_USERS, id: "LIST" },
                { type: TAG_USERS, id: "DELETED_LIST" },
            ],
            query: (id) => ({
                url: `/users/${id}/permanent`,
                method: "DELETE",
            }),
        }),
        getPermissionMatrix: builder.query<PermissionMatrixResponse, void>({
            providesTags: [{ type: TAG_USERS as typeof TAG_USERS, id: "PERMISSION_MATRIX" }],
            query: () => ({
                url: `/users/permission/matrix`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useAddUsersMutation,
    useGetUsersQuery,
    useDeleteUserMutation,
    useUpdateUserMutation,
    useGetUserDetailsQuery,
    usePermanentDeleteUserMutation,
    useGetPermissionMatrixQuery,
} = usersApi;
