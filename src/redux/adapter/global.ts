import { createEntityAdapter } from "@reduxjs/toolkit";
import { PaginationMeta } from "../../interface/common";

export interface BackendLocation {
    id: string;
    name: string;
}

export const countriesAdapter = createEntityAdapter<BackendLocation>({
    sortComparer: false,
});

export const countriesInitialState = countriesAdapter.getInitialState<{ meta: PaginationMeta | null }>({
    meta: null,
});

export const statesAdapter = createEntityAdapter<BackendLocation>({
    sortComparer: false,
});

export const statesInitialState = statesAdapter.getInitialState<{ meta: PaginationMeta | null }>({
    meta: null,
});

export const citiesAdapter = createEntityAdapter<BackendLocation>({
    sortComparer: false,
});

export const citiesInitialState = citiesAdapter.getInitialState<{ meta: PaginationMeta | null }>({
    meta: null,
});
