import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface UploadHistoryItem {
  id: string;

  platform: string;

  platformName: string;

  reportDate: string;

  market: string | null;

  fileName: string;

  rowCount: number;

  hasFile: boolean;

  uploadedBy: {
    id: string;
    name: string | null;
  };

  uploadedAt: string | null;
}

interface UploadHistoryResponse {
  message: string;

  data: {
    uploads: UploadHistoryItem[];

    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/*
 * ============================================================
 * API
 * ============================================================
 */

export const uploadHistoryApi =
  createApi({
    reducerPath:
      "uploadHistoryApi",

    baseQuery:
      fetchBaseQuery({
        baseUrl:
          import.meta.env
            .VITE_API_BASE_URL,

        credentials:
          "include",
      }),

    tagTypes: [
      "UploadHistory",
    ],

    endpoints: (
      builder,
    ) => ({
      /*
       * --------------------------------------------------------
       * LIST
       * --------------------------------------------------------
       */

      listUploads:
        builder.query<
          UploadHistoryResponse["data"],
          {
            page?: number;
            limit?: number;
          }
        >({
          query: ({
            page = 1,
            limit = 20,
          } = {}) => ({
            url: "/uploads",

            params: {
              page,
              limit,
            },
          }),

          transformResponse: (
            response: UploadHistoryResponse,
          ) => {
            return response.data;
          },

          providesTags: [
            "UploadHistory",
          ],
        }),

      /*
       * --------------------------------------------------------
       * DELETE
       * --------------------------------------------------------
       */

      deleteUpload:
        builder.mutation<
          void,
          string
        >({
          query: (id) => ({
            url: `/uploads/${id}`,

            method: "DELETE",
          }),

          invalidatesTags: [
            "UploadHistory",
          ],
        }),
    }),
  });

export const {
  useListUploadsQuery,
  useDeleteUploadMutation,
} = uploadHistoryApi;