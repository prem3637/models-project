import { baseResponse, PaginationMeta } from "./common";

export interface CreateRoleRequest {
    name: string;
    description?: string;
    permissions: string[];
    status?: "Active" | "Inactive";
    isVisible?: boolean;
}

export type PermissionItem = {
    id: string;
    subject: string;
    action: string;
    label: string;
}
export interface RoleEntityResponse {
    id: string;
    name: string;
    description: string;
    permissions: PermissionItem[];
    status: "Active" | "Inactive";
    isVisible: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RoleListResponse extends baseResponse {
    data: RoleEntityResponse[];
}

export interface RoleDeatilResponse extends baseResponse {
    data: RoleEntityResponse;
}

export interface UpdateRoleRequest extends CreateRoleRequest {
    id: string;
}

export type PermissionDto = {
    id: string;
    action: string;
};

export type PermissionModuleDto = {
    key: string;
    label: string;
    permissions: PermissionDto[];
};

export type PermissionMatrixDto = {
    actions: string[];
    modules: PermissionModuleDto[];
};

export interface PermissionMatrixResponse extends baseResponse {
    data: PermissionMatrixDto;
}

