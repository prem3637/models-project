import { modelsApi } from "./index";
import { countriesAdapter, countriesInitialState, statesAdapter, statesInitialState, citiesAdapter, citiesInitialState, BackendLocation } from "../adapter/global";
import { TAG_COUNTRIES, TAG_STATES, TAG_CITIES } from "../api-tags";
import { PaginationMeta } from "../../interface/common";

export interface GlobalQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export interface StateQuery extends GlobalQuery {
    country: string;
}

export interface CityQuery extends GlobalQuery {
    state: string;
}

export const globalApi = modelsApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getCountries: builder.query<typeof countriesInitialState, GlobalQuery | void>({
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: TAG_COUNTRIES as typeof TAG_COUNTRIES, id })),
                        { type: TAG_COUNTRIES as typeof TAG_COUNTRIES, id: "LIST" },
                    ]
                    : [{ type: TAG_COUNTRIES as typeof TAG_COUNTRIES, id: "LIST" }],
            query: (params) => ({
                url: "/globals/countries",
                method: "GET",
                params: params || undefined,
            }),
            transformResponse: (response: { data: BackendLocation[]; meta: PaginationMeta }) => {
                return countriesAdapter.setAll(
                    {
                        ...countriesInitialState,
                        meta: response?.meta || null,
                    },
                    response.data || [],
                );
            },
        }),
        getStates: builder.query<typeof statesInitialState, StateQuery>({
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: TAG_STATES as typeof TAG_STATES, id })),
                        { type: TAG_STATES as typeof TAG_STATES, id: "LIST" },
                    ]
                    : [{ type: TAG_STATES as typeof TAG_STATES, id: "LIST" }],
            query: (params) => ({
                url: `/globals/states`,
                method: "GET",
                params,
            }),
            transformResponse: (response: { data: BackendLocation[]; meta: PaginationMeta }) => {
                return statesAdapter.setAll(
                    {
                        ...statesInitialState,
                        meta: response?.meta || null,
                    },
                    response.data || [],
                );
            },
        }),
        getCities: builder.query<typeof citiesInitialState, CityQuery>({
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: TAG_CITIES as typeof TAG_CITIES, id })),
                        { type: TAG_CITIES as typeof TAG_CITIES, id: "LIST" },
                    ]
                    : [{ type: TAG_CITIES as typeof TAG_CITIES, id: "LIST" }],
            query: (params) => ({
                url: `/globals/cities`,
                method: "GET",
                params,
            }),
            transformResponse: (response: { data: BackendLocation[]; meta: PaginationMeta }) => {
                return citiesAdapter.setAll(
                    {
                        ...citiesInitialState,
                        meta: response?.meta || null,
                    },
                    response.data || [],
                );
            },
        }),
    }),
});

export const {
    useGetCountriesQuery,
    useGetStatesQuery,
    useGetCitiesQuery,
} = globalApi;
