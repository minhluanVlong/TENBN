import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, Clipboard, CheckCircle, AlertCircle } from 'lucide-react';
import { parseExcelFile, validateAndProcessPatients, ValidationSummary } from '../utils/excelParser';
import { Patient, RoomRule } from '../types';

interface DataUploaderProps {
  onDataLoaded: (patients: Patient[], summary: ValidationSummary, sourceName: string) => void;
  rules: RoomRule[];
  onLoadSample: () => void;
  onDownloadSample: () => void;
}

export const DataUploader: React.FC<DataUploaderProps> = ({
  onDataLoaded,
  rules,
  onLoadSample,
  onDownloadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteContent, setPasteContent] = useState('');

  const processFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { patients, summary } = await parseExcelFile(file, rules);
      onDataLoaded(patients, summary, file.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đọc file Excel.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) return;
    try {
      // Split lines
      const lines = pasteContent.trim().split(/\r?\n/);
      const rawList = lines.map(line => {
        // split by tab or comma
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        return {
          name: parts[0]?.trim(),
          room: parts[1]?.trim(),
          age: parts[2]?.trim(),
        };
      });

      const { patients, summary } = validateAndProcessPatients(rawList, rules);
      onDataLoaded(patients, summary, `Dán dữ liệu (${patients.length} dòng)`);
      setShowPasteModal(false);
      setPasteContent('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi định dạng dữ liệu dán.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Bước 1: Nạp File Excel Danh Sách Bệnh Nhân
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hỗ trợ các cột &quot;Họ tên&quot;, &quot;Phòng&quot;, &quot;Tuổi&quot;. Hệ thống sẽ tự động quét và kiểm tra dữ liệu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPasteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-600" />
            Dán bảng dữ liệu
          </button>
          <button
            type="button"
            onClick={onDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
          >
            Tải mẫu .XLSX
          </button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/80 scale-[0.99]'
            : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-12 h-12 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-600 mb-1">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Kéo thả file Excel vào đây, hoặc <span className="text-emerald-600 underline">bấm để duyệt file</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Định dạng hỗ trợ: <strong>.XLSX</strong>, <strong>.XLS</strong>, <strong>.CSV</strong>
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">hoặc</span>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onLoadSample();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Thử nhanh dữ liệu 24 bệnh nhân mẫu
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs rounded-xl flex items-center justify-center">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
              <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
              Đang phân tích file Excel...
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Paste Table Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Dán Dữ Liệu Bệnh Nhân Từ Excel / Bảng
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Mỗi dòng gồm: <code>[Họ tên] [Phòng] [Tuổi]</code> cách nhau bởi phím Tab hoặc dấu phẩy.
            </p>

            <textarea
              rows={6}
              value={pasteContent}
              onChange={e => setPasteContent(e.target.value)}
              placeholder="Nguyễn Văn An&#9;Khu Nội - Nhi: Hồi sức 1&#9;54&#10;Trần Thị Bích&#9;Khu Nhiễm: Buồng dương tính 1&#9;68"
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500"
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handlePasteSubmit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Xử Lý Dữ Liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
