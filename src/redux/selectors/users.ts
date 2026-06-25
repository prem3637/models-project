import { RootState } from "../store";
import { usersApi } from "../services/users";
import { PaginationQuery } from "../../interface/common";
import { usersAdapter, usersInitialState } from "../adapter/users";

export const selectUsersResult = (query: PaginationQuery) =>
    usersApi.endpoints.getUsers.select(query);

export const usersSelectors = (query: PaginationQuery) =>
    usersAdapter.getSelectors<RootState>((state: RootState) => {
        const result = selectUsersResult(query)(state);
        return result?.data ?? usersInitialState;
    });

export const selectAllUsers =
    (query: PaginationQuery) => (state: RootState) =>
        usersSelectors(query).selectAll(state);

export const selectUsersMeta =
    (query: PaginationQuery) => (state: RootState) => {
        const result = selectUsersResult(query)(state);
        return result?.data?.meta ?? null;
    };

export const selectCurrentPageUsers =
    (query: PaginationQuery) => (state: RootState) =>
        usersSelectors(query).selectAll(state);
