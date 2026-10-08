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

  hasOriginalFile: boolean;

  uploadedBy: {
    id: string;
    name: string | null;
  };

  uploadedAt: string | null;
}

export interface UploadHistoryResponse {
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

export interface ListUploadsParams {
  page?: number;

  limit?: number;

  platform?: string;

  from?: string;

  to?: string;
}

export interface DeleteUploadResponse {
  message: string;

  data: {
    id: string;

    platformName: string;

    reportDate: string;

    fileName: string;

    deletedRows: number;
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
       * LIST UPLOADS
       * --------------------------------------------------------
       */

      listUploads:
        builder.query<
          UploadHistoryResponse["data"],
          ListUploadsParams
        >({
          query: ({
            page = 1,

            limit = 20,

            platform,

            from,

            to,
          } = {}) => ({
            url: "/uploads",

            params: {
              page,

              limit,

              ...(platform
                ? {
                    platform,
                  }
                : {}),

              ...(from
                ? {
                    from,
                  }
                : {}),

              ...(to
                ? {
                    to,
                  }
                : {}),
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
       * DELETE UPLOAD
       * --------------------------------------------------------
       */

      deleteUpload:
        builder.mutation<
          DeleteUploadResponse,
          string
        >({
          query: (
            id,
          ) => ({
            url: `/uploads/${id}`,

            method: "DELETE",
          }),

          invalidatesTags: [
            "UploadHistory",
          ],
        }),
    }),
  });

/*
 * ============================================================
 * HOOKS
 * ============================================================
 */

export const {
  useListUploadsQuery,

  useLazyListUploadsQuery,

  useDeleteUploadMutation,
} =
  uploadHistoryApi;