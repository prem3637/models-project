import { modelsApi } from ".";
import { PaginationQuery } from "../../interface/common";
import { CreateRoleRequest, PermissionMatrixResponse, RoleDeatilResponse, RoleListResponse, UpdateRoleRequest } from "../../interface/role";
import { rolesAdapter, rolesInitialState } from "../adapter/roles";
import { TAG_ROLES, TAG_ROLES_STAT } from "../api-tags";


export const rolesApi = modelsApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        addRoles: builder.mutation<RoleDeatilResponse, CreateRoleRequest>({
            invalidatesTags: [
                { type: TAG_ROLES, id: "LIST" },
                { type: TAG_ROLES_STAT, id: "STAT" },
            ],
            query: (body) => ({
                url: "/roles",
                method: "POST",
                body,
            }),
        }),
        getRoles: builder.query<typeof rolesInitialState, PaginationQuery>({
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: TAG_ROLES as "roles", id })),
                        { type: TAG_ROLES as "roles", id: "LIST" },
                    ]
                    : [{ type: TAG_ROLES as "roles", id: "LIST" }],
            query: (params) => ({
                url: `/roles`,
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
            transformResponse: (response: RoleListResponse) => {
                return rolesAdapter.setAll(
                    {
                        ...rolesInitialState,
                        meta: response?.meta || null,
                    },
                    response.data,
                );
            },
        }),
        getroleDetails: builder.query<RoleDeatilResponse, string>({
            providesTags: (result, error, id) => [
                { type: TAG_ROLES, id },
                { type: TAG_ROLES, id: "Details" },
            ],
            query: (id) => ({
                url: `/roles/${id}`,
                method: "GET",
            }),
        }),
        updateRole: builder.mutation<RoleDeatilResponse, UpdateRoleRequest>({
            invalidatesTags: [
                { type: TAG_ROLES, id: "LIST" },
                { type: TAG_ROLES_STAT, id: "STAT" },
            ],
            query: ({ id, ...body }) => ({
                url: `/roles/${id}`,
                method: "PUT",
                body,
            }),
        }),
        deleteRole: builder.mutation<void, string>({
            invalidatesTags: [
                { type: TAG_ROLES, id: "LIST" },
                { type: TAG_ROLES, id: "DELETED_LIST" },
                { type: TAG_ROLES_STAT, id: "STAT" },
            ],
            query: (id) => ({
                url: `/roles/${id}`,
                method: "DELETE",
            }),
        }),
        // getRolesStat: builder.query<RolesStatResponse, void>({
        //     providesTags: [{ type: TAG_ROLES_STAT, id: "STAT" }],
        //     query: () => ({
        //         url: `/roles/stat`,
        //         method: "GET",
        //     }),
        // }),
        permanentDeleteRole: builder.mutation<void, string>({
            invalidatesTags: [
                { type: TAG_ROLES, id: "LIST" },
                { type: TAG_ROLES_STAT, id: "STAT" },
                { type: TAG_ROLES, id: "DELETED_LIST" },
            ],
            query: (id) => ({
                url: `/roles/${id}/permanent`,
                method: "DELETE",
            }),
        }),
        getPermissionMatrix: builder.query<PermissionMatrixResponse, void>({
            providesTags: [{ type: TAG_ROLES as typeof TAG_ROLES, id: "PERMISSION_MATRIX" }],
            query: () => ({
                url: `/roles/permission/matrix`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useAddRolesMutation,
    useGetRolesQuery,
    useDeleteRoleMutation,
    useUpdateRoleMutation,
    useGetroleDetailsQuery,
    usePermanentDeleteRoleMutation,
    useGetPermissionMatrixQuery,
} = rolesApi;
