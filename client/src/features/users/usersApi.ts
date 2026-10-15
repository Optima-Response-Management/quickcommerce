import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import type {
  Feature,
  GrantableFeature,
} from "./access";

import type {
  ManagedUser,
  PlatformAccess,
  Role,
} from "./types";

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
}

export interface UsersListResponse {
  users: ManagedUser[];
  total: number;
  page: number;
  limit: number;
}

interface RawUsersResponse {
  data: UsersListResponse;
  message?: string;
}

interface RawUserResponse {
  data: {
    user: ManagedUser;
  };
  message?: string;
}

interface RawDeleteResponse {
  data: {
    id: string;
  };
  message?: string;
}

export interface ListUsersArgs {
  search?: string;
  role?: Role;
  page?: number;
  limit?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  platformAccess: PlatformAccess;
  platforms: string[];
  features: GrantableFeature[];
}

export interface UpdateUserAccessRequest {
  id: string;
  platformAccess: PlatformAccess;
  platforms: string[];
  features: Feature[];
}

export const usersApi = createApi({
  reducerPath: "usersApi",

  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_API_BASE_URL,    credentials: "include",
  }),

  tagTypes: ["Users"],

  endpoints: (builder) => ({
    getUsers: builder.query<
      UsersListResponse,
      ListUsersArgs
    >({
      query: ({
        search,
        role,
        page = 1,
        limit = 20,
      }) => ({
        url: "/users",
        params: {
          search:
            search?.trim() || undefined,
          role: role || undefined,
          page,
          limit,
        },
      }),

      transformResponse: (
        response: RawUsersResponse,
      ) => response.data,

      providesTags: ["Users"],
    }),

    createUser: builder.mutation<
      ManagedUser,
      CreateUserRequest
    >({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: RawUserResponse,
      ) => response.data.user,

      invalidatesTags: ["Users"],
    }),

    updateUserAccess:
      builder.mutation<
        ManagedUser,
        UpdateUserAccessRequest
      >({
        query: ({
          id,
          platformAccess,
          platforms,
          features,
        }) => ({
          url: `/users/${id}/access`,
          method: "PATCH",
          body: {
            platformAccess,
            platforms,
            features,
          },
        }),

        transformResponse: (
          response: RawUserResponse,
        ) => response.data.user,

        invalidatesTags: ["Users"],
      }),

    deleteUser: builder.mutation<
      string,
      string
    >({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),

      transformResponse: (
        response: RawDeleteResponse,
      ) => response.data.id,

      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserAccessMutation,
  useDeleteUserMutation,
} = usersApi;