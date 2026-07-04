import { modelsApi } from "./index";
import { DashboardStatsResponse } from "../../interface/dashboard";
import { TAG_DASHBOARD } from "../api-tags";

export const dashboardServiceApi = modelsApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getDashboardData: builder.query<DashboardStatsResponse, void>({
            providesTags: [{ type: TAG_DASHBOARD as "Dashboard", id: "Dashboard" }],
            query: () => ({
                url: "/dashboard",
                method: "GET",
            }),
        }),
    }),
});

export const {
    useGetDashboardDataQuery,
} = dashboardServiceApi;
