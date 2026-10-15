import { baseApi } from "../auth/baseApi"; // adjust to where baseApi lives
import type { LoginFormValues } from "./authSchema";
import type { AuthUser } from "./authSlice";

/* ── Types ── */

interface AuthResponse {
  success?: boolean;
  message?: string;
  user?: AuthUser;
  data?: { user?: AuthUser } | AuthUser;
}

export interface AuthUserResponse {
  user: AuthUser;
}

export interface MessageResponse {
  success?: boolean;
  message?: string;
}

function extractUser(response: AuthResponse): AuthUserResponse {
  const data = response?.data;

  let user: AuthUser | undefined;

  if (data && "user" in data) {
    user = data.user;
  } else if (data && "id" in data) {
    user = data as AuthUser;
  } else {
    user = response?.user;
  }

  if (!user || !user.id) {
    throw new Error(
      response?.message || "Invalid authentication response: user not found.",
    );
  }

  return { user };
}

/* ── Auth API ── */

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthUserResponse, LoginFormValues>({
      query: (body) => ({
        url: "/auth/signin",
        method: "POST",
        body,
      }),
      transformResponse: (response: AuthResponse) => extractUser(response),
    }),

    me: builder.query<AuthUserResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
        cache: "no-store",
      }),
      transformResponse: (response: AuthResponse) => extractUser(response),
    }),

    logout: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useLoginMutation,
  useMeQuery,
  useLazyMeQuery,
  useLogoutMutation,
} = authApi;