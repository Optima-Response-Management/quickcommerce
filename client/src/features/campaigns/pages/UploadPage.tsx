import UploadExcel from "../components/UploadExcel";

export default function UploadPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-ink mb-1">Upload Campaign Data</h2>
      <p className="text-sm text-brand-gray mb-6">
        Select the platform and report type, then upload the Excel file to extract and preview the data
      </p>
      <UploadExcel />
    </div>
  );
}