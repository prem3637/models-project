import { RootState } from "../store";
import { modelsServiceApi, ModelPaginationQuery } from "../services/models";
import { modelsAdapter, modelsInitialState } from "../adapter/models";

export const selectModelsResult = (query: ModelPaginationQuery) =>
    modelsServiceApi.endpoints.getModels.select(query);

export const modelsSelectors = (query: ModelPaginationQuery) =>
    modelsAdapter.getSelectors<RootState>((state: RootState) => {
        const result = selectModelsResult(query)(state);
        return result?.data ?? modelsInitialState;
    });

export const selectAllModels =
    (query: ModelPaginationQuery) => (state: RootState) =>
        modelsSelectors(query).selectAll(state);

export const selectModelsMeta =
    (query: ModelPaginationQuery) => (state: RootState) => {
        const result = selectModelsResult(query)(state);
        return result?.data?.meta ?? null;
    };

export const selectCurrentPageModels =
    (query: ModelPaginationQuery) => (state: RootState) =>
        modelsSelectors(query).selectAll(state);

