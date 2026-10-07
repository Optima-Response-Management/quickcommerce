import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";

import { authApi } from "../features/auth/authApi";

import { dashboardApi } from "../features/campaigns/dashboardApi";

import { uploadApi } from "../features/campaigns/uploadApi";

import { usersApi } from "../features/users/usersApi";

export const store =
  configureStore({
    reducer: {
      auth: authReducer,

      [authApi.reducerPath]:
        authApi.reducer,

      [dashboardApi.reducerPath]:
        dashboardApi.reducer,

      [uploadApi.reducerPath]:
        uploadApi.reducer,

      [usersApi.reducerPath]:
        usersApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        dashboardApi.middleware,
        uploadApi.middleware,
        usersApi.middleware,
      ),
  });

export type RootState =
  ReturnType<typeof store.getState>;

export type AppDispatch =
  typeof store.dispatch;