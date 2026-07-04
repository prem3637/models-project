import { createEntityAdapter } from "@reduxjs/toolkit";
import { PaginationMeta } from "../../interface/common";
import { IModel } from "../../interface/model";

export const modelsAdapter = createEntityAdapter({
    selectId: (model: IModel) => model.id,
    sortComparer: false,
});

export const modelsInitialState = modelsAdapter.getInitialState<{ meta: PaginationMeta | null }>({
    meta: null,
});
