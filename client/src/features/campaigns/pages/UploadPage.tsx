export default function UploadPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-black mb-1">Upload Campaign Data</h2>
      <p className="text-sm text-brand-gray mb-6">Upload an Excel file to extract and process campaign data</p>

      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-sm text-brand-gray">Drag & drop or click to upload — UploadExcel.tsx goes here</p>
      </div>
    </div>
  );
}