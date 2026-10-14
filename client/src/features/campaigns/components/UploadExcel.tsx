import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import {
  useGetPlatformsQuery,
} from "../dashboardApi";
import {
  useUploadCampaignMutation,
} from "../uploadApi";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".csv", ".xlsx"];

const isValidFile = (selectedFile: File) => {
  const fileName = selectedFile.name.toLowerCase();

  return ACCEPTED_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension),
  );
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error
  ) {
    const data = (error as { data?: unknown }).data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while uploading the file.";
};

export default function UploadExcel() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [platform, setPlatform] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    data: platforms = [],
    isLoading: isPlatformsLoading,
    isError: isPlatformsError,
  } = useGetPlatformsQuery();

  const [
    uploadCampaign,
    {
      isLoading: isUploading,
    },
  ] = useUploadCampaignMutation();

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const processFile = useCallback((selectedFile: File) => {
    resetMessages();

    if (!isValidFile(selectedFile)) {
      setFile(null);
      setError("Only .csv and .xlsx files are supported.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("File size must be 5 MB or less.");
      return;
    }

    setFile(selectedFile);
  }, []);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    processFile(selectedFile);

    // Allows selecting the same file again after removing it.
    event.target.value = "";
  };

  const handleDragEnter = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile) {
      return;
    }

    processFile(droppedFile);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    resetMessages();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    /*
     * IMPORTANT:
     *
     * Without this, the browser performs the default HTML
     * form submission and navigates to:
     *
     * GET /api/campaigns/upload
     *
     * RTK Query never gets a chance to execute.
     */
    event.preventDefault();
    event.stopPropagation();

    resetMessages();

    if (!platform) {
      setError("Please select a platform.");
      return;
    }

    if (!reportDate) {
      setError("Please select a report date.");
      return;
    }

    if (!file) {
      setError("Please select a CSV or XLSX file.");
      return;
    }

    try {
      const result = await uploadCampaign({
        file,
        platform,
        reportDate,
      }).unwrap();


      setSuccess(
        `Successfully uploaded ${result.rowCount.toLocaleString()} campaign${
          result.rowCount === 1 ? "" : "s"
        } for ${result.platformName}.`,
      );

      // Clear the form after successful upload.
      setFile(null);
      setPlatform("");
      setReportDate("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadError) {
      console.error("Campaign upload failed:", uploadError);

      setError(getErrorMessage(uploadError));
    }
  };

  return (
    <div className="min-h-full bg-brand-offwhite px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
          <form onSubmit={handleSubmit}>
            {/* Settings */}
            <div className="border-b border-brand-border px-5 py-6 sm:px-7">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-brand-ink">
                  Import settings
                </h2>

                <p className="mt-1 text-sm text-brand-gray">
                  Select the platform and reporting date before
                  uploading your file.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Platform */}
                <div>
                  <label
                    htmlFor="platform"
                    className="mb-2 block text-sm font-semibold text-brand-ink"
                  >
                    Platform
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      id="platform"
                      name="platform"
                      value={platform}
                      onChange={(event) => {
                        setPlatform(event.target.value);
                        resetMessages();
                      }}
                      disabled={
                        isPlatformsLoading || isUploading
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-brand-border bg-white px-3.5 pr-10 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">
                        {isPlatformsLoading
                          ? "Loading platforms..."
                          : "Select platform"}
                      </option>

                      {platforms.map((item) => (
                        <option
                          key={item.id}
                          value={item.slug}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
                  </div>

                  {isPlatformsError && (
                    <p className="mt-2 text-xs text-red-500">
                      Unable to load platforms. Please refresh and
                      try again.
                    </p>
                  )}
                </div>

                {/* Report Date */}
                <div>
                  <label
                    htmlFor="reportDate"
                    className="mb-2 block text-sm font-semibold text-brand-ink"
                  >
                    Report date
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="reportDate"
                    name="reportDate"
                    type="date"
                    value={reportDate}
                    onChange={(event) => {
                      setReportDate(event.target.value);
                      resetMessages();
                    }}
                    disabled={isUploading}
                    className="h-11 w-full rounded-xl border border-brand-border bg-white px-3.5 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                {/* Report Type - Disabled */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="reportType"
                      className="mb-2 block text-sm font-semibold text-brand-ink"
                    >
                      Report type
                    </label>

                    <span className="mb-2 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Coming soon
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      id="reportType"
                      name="reportType"
                      disabled
                      value=""
                      className="h-11 w-full appearance-none rounded-xl border border-brand-border bg-gray-50 px-3.5 pr-10 text-sm text-gray-400"
                    >
                      <option value="">
                        Report type selection will be available soon
                      </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="px-5 py-6 sm:px-7">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-brand-ink">
                  Campaign file
                </h2>

                <p className="mt-1 text-sm text-brand-gray">
                  Upload the CSV or Excel file containing your
                  campaign data.
                </p>
              </div>

              {!file ? (
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                  className={`group relative flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
                    dragActive
                      ? "scale-[1.01] border-brand-primary bg-brand-primary/5"
                      : "border-brand-border bg-gray-50/60 hover:border-brand-primary/50 hover:bg-brand-primary/[0.03]"
                  }`}
                >
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
                      dragActive
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                        : "bg-white text-brand-primary shadow-sm ring-1 ring-brand-border group-hover:scale-105"
                    }`}
                  >
                    <CloudUpload className="h-7 w-7" />
                  </div>

                  <h3 className="text-sm font-semibold text-brand-ink">
                    {dragActive
                      ? "Drop your file here"
                      : "Drag & drop your file here"}
                  </h3>

                  <p className="mt-1 text-sm text-brand-gray">
                    or click to browse from your computer
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-lg border border-brand-border bg-white px-2.5 py-1 text-xs font-medium text-brand-gray">
                      CSV
                    </span>

                    <span className="rounded-lg border border-brand-border bg-white px-2.5 py-1 text-xs font-medium text-brand-gray">
                      XLSX
                    </span>

                    <span className="text-xs text-brand-gray">
                      Max 5 MB
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-brand-border bg-brand-primary/[0.03] p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-brand-primary shadow-sm ring-1 ring-brand-border">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-brand-gray">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isUploading}
                      aria-label="Remove selected file"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-brand-gray transition hover:bg-white hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Supported file information */}
              <div className="mt-4 flex items-start gap-2 text-xs text-brand-gray">
                <FileUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                <p>
                  Make sure the uploaded file matches the expected
                  campaign template and contains the required columns.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Upload failed
                    </p>

                    <p className="mt-0.5 text-sm text-red-600">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Upload successful
                    </p>

                    <p className="mt-0.5 text-sm text-green-600">
                      {success}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-brand-border bg-gray-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="text-xs text-brand-gray">
                <span className="text-red-500">*</span>{" "}
                Required fields
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setPlatform("");
                    setReportDate("");
                    setFile(null);
                    resetMessages();

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isUploading}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-brand-border bg-white px-5 text-sm font-semibold text-brand-ink transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={
                    isUploading ||
                    isPlatformsLoading ||
                    !platform ||
                    !reportDate ||
                    !file
                  }
                  className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

       
      </div>
    </div>
  );
}