export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number
}

export interface baseResponse {
    success: boolean;
    message: string;
    status: string,
    meta?: PaginationMeta,
}

export interface PaginationQuery {
    page: number;
    limit: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
    status?: string;
    search?: string;
}