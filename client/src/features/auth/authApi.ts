
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { AuthUser } from "./authSlice";
import type { LoginFormValues } from "./authSchema";

interface AuthResponse {
  user: AuthUser;
}

type RawAuthResponse = {
  user?: AuthUser;
  data?: AuthUser | { user: AuthUser };
};

function extractUser(response: RawAuthResponse): AuthUser {
  const data = response.data;

  if (data && "user" in data) {
    return data.user;
  }

  if (data) {
    return data;
  }

  if (response.user) {
    return response.user;
  }

  throw new Error("Invalid authentication response from server.");
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL is missing. Configure it to point to your backend API.",
  );
}

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),

  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginFormValues>({
      query: (body) => ({
        url: "/auth/signin",
        method: "POST",
        body,
      }),

      transformResponse: (response: RawAuthResponse): AuthResponse => ({
        user: extractUser(response),
      }),
    }),

    me: builder.query<AuthResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),

      transformResponse: (response: RawAuthResponse): AuthResponse => ({
        user: extractUser(response),
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useMeQuery,
  useLazyMeQuery,
  useLogoutMutation,
} = authApi;
