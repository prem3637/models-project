import { RootState } from "../store";
import { globalApi, GlobalQuery, StateQuery, CityQuery } from "../services/global";
import { countriesAdapter, countriesInitialState, statesAdapter, statesInitialState, citiesAdapter, citiesInitialState } from "../adapter/global";

// Countries selectors
export const selectCountriesResult = (query: GlobalQuery | void) =>
    globalApi.endpoints.getCountries.select(query);

export const countriesSelectors = (query: GlobalQuery | void) =>
    countriesAdapter.getSelectors<RootState>((state: RootState) => {
        const result = selectCountriesResult(query)(state);
        return result?.data ?? countriesInitialState;
    });

export const selectCountriesData =
    (query: GlobalQuery | void) => (state: RootState) =>
        countriesSelectors(query).selectAll(state);

export const selectCountriesMeta =
    (query: GlobalQuery | void) => (state: RootState) => {
        const result = selectCountriesResult(query)(state);
        return result?.data?.meta ?? null;
    };

// States selectors
export const selectStatesResult = (query: StateQuery) =>
    globalApi.endpoints.getStates.select(query);

export const statesSelectors = (query: StateQuery) =>
    statesAdapter.getSelectors<RootState>((state: RootState) => {
        const result = selectStatesResult(query)(state);
        return result?.data ?? statesInitialState;
    });

export const selectStatesData =
    (query: StateQuery) => (state: RootState) =>
        statesSelectors(query).selectAll(state);

export const selectStatesMeta =
    (query: StateQuery) => (state: RootState) => {
        const result = selectStatesResult(query)(state);
        return result?.data?.meta ?? null;
    };

// Cities selectors
export const selectCitiesResult = (query: CityQuery) =>
    globalApi.endpoints.getCities.select(query);

export const citiesSelectors = (query: CityQuery) =>
    citiesAdapter.getSelectors<RootState>((state: RootState) => {
        const result = selectCitiesResult(query)(state);
        return result?.data ?? citiesInitialState;
    });

export const selectCitiesData =
    (query: CityQuery) => (state: RootState) =>
        citiesSelectors(query).selectAll(state);

export const selectCitiesMeta =
    (query: CityQuery) => (state: RootState) => {
        const result = selectCitiesResult(query)(state);
        return result?.data?.meta ?? null;
    };
