import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import uiReducer from "./slices/ui";
import { modelsApi } from "./services";
import { MODEL_MANAGEMENT } from "./api-tags";

const rootReducer = combineReducers({
    auth: authReducer,
    ui: uiReducer,
    [MODEL_MANAGEMENT]: modelsApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
