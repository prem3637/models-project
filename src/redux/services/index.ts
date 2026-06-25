import {
    BaseQueryFn,
    createApi,
    fetchBaseQuery,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/auth";
import { MODEL_MANAGEMENT, TAG_CURRENT_USER, TAG_ROLES, TAG_ROLES_STAT, TAG_USERS } from "../api-tags";
import envConfig from "../../config";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: envConfig.api_url,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as { auth?: { token?: string } };
        const token = state.auth?.token;

        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithAuthGuard: BaseQueryFn<
    string | { url: string; method?: string; body?: unknown },
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        api.dispatch(logout());
    }

    return result;
};

export const modelsApi = createApi({
    reducerPath: MODEL_MANAGEMENT,
    tagTypes: [TAG_CURRENT_USER, TAG_ROLES_STAT, TAG_ROLES, TAG_USERS],
    baseQuery: baseQueryWithAuthGuard,
    endpoints: () => ({}),
});
