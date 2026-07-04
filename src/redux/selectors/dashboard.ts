import { RootState } from "../store";
import { dashboardServiceApi } from "../services/dashboard";

export const selectDashboardResult = () =>
    dashboardServiceApi.endpoints.getDashboardData.select();

export const selectDashboardData = (state: RootState) => {
    const result = selectDashboardResult()(state);
    return result?.data?.data ?? null;
};
