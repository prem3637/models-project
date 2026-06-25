import { createEntityAdapter } from "@reduxjs/toolkit";
import { PaginationMeta } from "../../interface/common";
import { IUser } from "../../interface/user";

export const usersAdapter = createEntityAdapter({
    selectId: (user: IUser) => user.id,
    sortComparer: false,
});

export const usersInitialState = usersAdapter.getInitialState<{ meta: PaginationMeta | null }>({
    meta: null,
});
