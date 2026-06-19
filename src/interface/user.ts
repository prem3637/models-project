
export interface IRole {
    id: string;
    name: string;
    description: string;
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
    contactNumber: string;
    permissions: string[];
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string
}