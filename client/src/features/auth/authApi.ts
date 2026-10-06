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

function extractUser(res: RawAuthResponse): AuthUser {
  const d = res.data;
  if (d && "user" in d) return d.user;
  if (d) return d;
  return res.user as AuthUser;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginFormValues>({
      query: (body) => ({ url: "/auth/signin", method: "POST", body }),
      transformResponse: (res: RawAuthResponse): AuthResponse => ({ user: extractUser(res) }),
    }),
    me: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      transformResponse: (res: RawAuthResponse): AuthResponse => ({ user: extractUser(res) }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

console.log("API base:", import.meta.env.VITE_API_BASE_URL);

export const { useLoginMutation, useMeQuery, useLogoutMutation } = authApi;