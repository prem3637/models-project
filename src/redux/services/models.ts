import { modelsApi } from ".";
import { PaginationQuery } from "../../interface/common";
import { ModelDetailResponse, ModelListResponse, UpdateModelRequest } from "../../interface/model";
import { modelsAdapter, modelsInitialState } from "../adapter/models";
import { TAG_MODELS } from "../api-tags";


export interface ModelPaginationQuery extends PaginationQuery {
    category?: string;
    gender?: string;
    country?: string;
    state?: string;
    city?: string;
    minAge?: number;
    maxAge?: number;
    minHeight?: number;
    maxHeight?: number;
}

export const modelsServiceApi = modelsApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getModels: builder.query<typeof modelsInitialState, ModelPaginationQuery>({
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: TAG_MODELS as "Models", id })),
                        { type: TAG_MODELS as "Models", id: "LIST" },
                    ]
                    : [{ type: TAG_MODELS as "Models", id: "LIST" }],
            query: (params) => ({
                url: `/models`,
                method: "GET",
                params: {
                    page: params.page,
                    limit: params.limit,
                    orderBy: params.orderBy,
                    order: params.order,
                    status: params.status,
                    search: params.search,
                    category: params.category,
                    gender: params.gender,
                    country: params.country,
                    state: params.state,
                    city: params.city,
                    minAge: params.minAge,
                    maxAge: params.maxAge,
                    minHeight: params.minHeight,
                    maxHeight: params.maxHeight,
                },
            }),
            transformResponse: (response: ModelListResponse) => {
                return modelsAdapter.setAll(
                    {
                        ...modelsInitialState,
                        meta: response?.meta || null,
                    },
                    response.data,
                );
            },
        }),
        getModelDetails: builder.query<ModelDetailResponse, string>({
            providesTags: (result, error, id) => [
                { type: TAG_MODELS, id },
                { type: TAG_MODELS, id: "Details" },
            ],
            query: (id) => ({
                url: `/models/${id}`,
                method: "GET",
            }),
        }),
        addModel: builder.mutation<ModelDetailResponse, FormData>({
            invalidatesTags: [
                { type: TAG_MODELS, id: "LIST" },
            ],
            query: (body) => ({
                url: "/models",
                method: "POST",
                body,
            }),
        }),
        updateModel: builder.mutation<ModelDetailResponse, { id: string; body: FormData | UpdateModelRequest }>({
            invalidatesTags: (result, error, arg) => [
                { type: TAG_MODELS, id: "LIST" },
                { type: TAG_MODELS, id: arg.id },
                { type: TAG_MODELS, id: "Details" },
            ],
            query: ({ id, body }) => ({
                url: `/models/${id}`,
                method: "PUT",
                body,
            }),
        }),
        deleteModel: builder.mutation<void, string>({
            invalidatesTags: [
                { type: TAG_MODELS, id: "LIST" },
            ],
            query: (id) => ({
                url: `/models/${id}/permanent`,
                method: "DELETE",
            }),
        }),
        removeModelFile: builder.mutation<void, { id: string; fileId: string }>({
            invalidatesTags: (result, error, arg) => [
                { type: TAG_MODELS, id: arg.id },
                { type: TAG_MODELS, id: "LIST" },
                { type: TAG_MODELS, id: "Details" },
            ],
            query: ({ id, fileId }) => ({
                url: `/models/${id}/file/${fileId}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useGetModelsQuery,
    useGetModelDetailsQuery,
    useAddModelMutation,
    useUpdateModelMutation,
    useDeleteModelMutation,
    useRemoveModelFileMutation,
} = modelsServiceApi;
