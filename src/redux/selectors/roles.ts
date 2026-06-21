import { RootState } from "../store";
import { rolesApi } from "../services/roles";
import { PaginationQuery } from "../../interface/common";
import { rolesAdapter, rolesInitialState } from "../adapter/roles";

export const selectRolesResult = (query: PaginationQuery) =>
  rolesApi.endpoints.getRoles.select(query);

export const rolesSelectors = (query: PaginationQuery) =>
  rolesAdapter.getSelectors<RootState>((state: RootState) => {
    const result = selectRolesResult(query)(state);
    return result?.data ?? rolesInitialState;
  });

export const selectAllRoles =
  (query: PaginationQuery) => (state: RootState) =>
    rolesSelectors(query).selectAll(state);

export const selectRolesMeta =
  (query: PaginationQuery) => (state: RootState) => {
    const result = selectRolesResult(query)(state);
    return result?.data?.meta ?? null;
  };

export const selectCurrentPageRoles =
  (query: PaginationQuery) => (state: RootState) =>
    rolesSelectors(query).selectAll(state);
