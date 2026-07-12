import { baseResponse } from "./common";

export interface ImageResponse {
    id: string;
    url: string;
    path: string;
    size: number;
    mimeType: string;
}

export interface LocationResponse {
    id: string;
    name: string;
}

export interface IModel {
    id: string;
    basicDeatils: {
        fullName: string;
        email: string;
        primartContact: {
            code: string;
            number: string;
        };
        secondryContact?: {
            code: string;
            number: string;
        };
        age: number;
        dob?: string;
        gender: "Male" | "Female" | "Other";
        modelType?: string;
    };
    physicalCharacteristics: {
        complexion?: string;
        bodyShape?: string;
        eyeColor?: string;
        hairColor?: string;
    };
    measurements: {
        height: string;
        weight: string;
        bust?: string;
        waist?: string;
        hips?: string;
        shoe?: string;
        eyeColor?: string;
        chest?: string;
        shoulder: string;
        size?: string;
    };
    images: ImageResponse[]; // File references
    introVideo?: ImageResponse | null; // File reference
    profilePicture?: ImageResponse | null; // Profile picture reference
    address: {
        addressLine1: string;
        addressLine2?: string;
        country: LocationResponse | null; // Populated Country
        state: LocationResponse | null; // Populated State
        city: LocationResponse | null; // Populated City
        postalCode: string;
    };
    bio: string;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ModelDetailResponse extends baseResponse {
    data: IModel;
}

export interface ModelListResponse extends baseResponse {
    data: IModel[];
}

export interface CreateModelRequest {
    basicDeatils: {
        fullName: string;
        email: string;
        primartContact: {
            code: string;
            number: string;
        };
        secondryContact?: {
            code: string;
            number: string;
        };
        age?: number;
        dob: string;
        gender: "Male" | "Female" | "Other";
        modelType?: string;
    };
    physicalCharacteristics: {
        complexion?: string;
        bodyShape?: string;
        eyeColor?: string;
        hairColor?: string;
    };
    measurements: {
        height: string;
        weight: string;
        bust?: string;
        waist?: string;
        hips?: string;
        shoe?: string;
        chest?: string;
        shoulder: string;
        size?: string;
    };
    address: {
        addressLine1: string;
        addressLine2?: string;
        country: string; // ObjectId string
        state: string; // ObjectId string
        city: string; // ObjectId string
        postalCode: string;
    };
    bio: string;
    profilePicture?: any;
}

export type UpdateModelRequest = Partial<CreateModelRequest>;
