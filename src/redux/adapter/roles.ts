import { createEntityAdapter } from "@reduxjs/toolkit";
import { PaginationMeta } from "../../interface/common";
import { RoleEntityResponse } from "../../interface/role";

export const rolesAdapter = createEntityAdapter({
    selectId: (role: RoleEntityResponse) => role.id,
    sortComparer: false,
});

export const rolesInitialState = rolesAdapter.getInitialState<{ meta: PaginationMeta | null }>({
    meta: null,
});
