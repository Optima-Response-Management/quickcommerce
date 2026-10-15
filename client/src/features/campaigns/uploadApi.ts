import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* =========================================================
   UPLOAD RESULT
========================================================= */

export interface UploadCampaignResult {
  uploadId: string;
  platform: string;
  platformName: string;
  reportDate: string;
  market: string | null;
  fileName: string;
  rowCount: number;
  skippedTotalRows?: number;
}

/* =========================================================
   UPLOAD ARGUMENTS
========================================================= */

export interface UploadCampaignArgs {
  file: File;
  platform: string;
  reportDate: string;
}

/* =========================================================
   RAW API RESPONSE
========================================================= */

interface RawUploadResponse {
  message: string;
  data: UploadCampaignResult;
}

/* =========================================================
   UPLOAD API
========================================================= */

export const uploadApi = createApi({
  reducerPath: "uploadApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,    credentials: "include",
  }),

  tagTypes: ["UploadHistory"],

  endpoints: (builder) => ({
    /* =====================================================
       UPLOAD CAMPAIGN FILE

       POST /api/campaigns/upload
    ===================================================== */

    uploadCampaign: builder.mutation<
      UploadCampaignResult,
      UploadCampaignArgs
    >({
      query: ({
        file,
        platform,
        reportDate,
      }) => {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("platform", platform);
        formData.append("reportDate", reportDate);

        return {
          url: "/campaigns/upload",
          method: "POST",
          body: formData,
        };
      },

      transformResponse: (
        response: RawUploadResponse,
      ) => {
        return response.data;
      },

      invalidatesTags: ["UploadHistory"],
    }),
  }),
});

/* =========================================================
   HOOKS
========================================================= */

export const {
  useUploadCampaignMutation,
} = uploadApi;