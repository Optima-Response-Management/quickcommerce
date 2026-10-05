import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import usersReducer from "../features/users/userSlice";
import { authApi } from "../features/auth/authApi";
import { dashboardApi } from "../features/campaigns/dashboardApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,

    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware , dashboardApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;