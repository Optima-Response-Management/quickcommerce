import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginFormValues } from "./authSchema";
import type { AuthUser } from "./authSlice";

interface AuthResponse {
  success?: boolean;
  message?: string;
  user?: AuthUser;
  data?: {
    user?: AuthUser;
  } | AuthUser;
}

interface AuthUserResponse {
  user: AuthUser;
}

function extractUser(response: AuthResponse): AuthUserResponse {
  const user =
    response?.data &&
    "user" in response.data
      ? response.data.user
      : response?.user ??
        (response?.data &&
        "id" in response.data
          ? response.data
          : undefined);

  if (!user || !user.id) {
    throw new Error(
      "Invalid authentication response: user not found.",
    );
  }

  return { user };
}

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: fetchBaseQuery({
    // VITE_API_BASE_URL should include /api if your
    // backend routes are mounted under /api.
    baseUrl: import.meta.env.VITE_API_BASE_URL,

    // Send the HTTP-only authentication cookie.
    credentials: "include",

    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),

  endpoints: (builder) => ({
    login: builder.mutation<AuthUserResponse, LoginFormValues>({
      query: (credentials) => ({
        url: "/auth/signin",
        method: "POST",
        body: credentials,
      }),

      transformResponse: (response: AuthResponse) =>
        extractUser(response),
    }),

    me: builder.query<AuthUserResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),

      transformResponse: (response: AuthResponse) =>
        extractUser(response),
    }),

    logout: builder.mutation<
      { success?: boolean; message?: string },
      void
    >({
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