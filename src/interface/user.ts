import { baseResponse } from "./common";

export interface IRole {
    id: string;
    name: string;
    status: string;
}

export interface IAddress {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface IUser {
    id: string;
    fullName: string;
    email: string;
    department: string;
    status: "Active" | "Inactive";
    role: IRole;
    address: IAddress;
    profilePicture: string;
    bio: string;
    contactNumber: string;
    permissions: string[];
    token: string;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
}


export interface LoginRequest {
    email: string;
    password: string
}

export interface CreateUserRequest {
    fullName: string;
    email: string;
    department: string;
    status: "Active" | "Inactive";
    role: string;
    address: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    profilePicture?: string;
    bio?: string;
    contactNumber: string;
    password: string;
};

export interface UserDetailResponse extends baseResponse {
    data: IUser
}

export interface UserListResponse extends baseResponse {
    data: IUser[];
}

export interface UpdateUserRequest extends Omit<CreateUserRequest, 'password'> {
    id: string;
    password?: string;
}