import React from 'react';
import { Printer, Download, FileSpreadsheet, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onDownloadSample: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  isGeneratingPdf: boolean;
  patientCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onDownloadSample,
  onPrint,
  onExportPdf,
  isGeneratingPdf,
  patientCount,
}) => {
  return (
    <header className="no-print bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <span className="font-bold text-xl leading-none">Rx</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  In Thẻ Chia Thuốc Bệnh Nhân Chuẩn A4
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Y Tế
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tự động chuẩn hóa tên phòng • Kiểm tra dữ liệu • Xuất lưới 21-24 thẻ/trang
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onDownloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Tải file Excel mẫu gồm đầy đủ các khoa phòng"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              File Excel Mẫu
            </button>

            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              title="Nạp ngay 24 bệnh nhân mẫu thực tế từ các khoa phòng"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Nạp Dữ Liệu Mẫu
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={onPrint}
              disabled={patientCount === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              In Ngay (Ctrl+P)
            </button>

            <button
              type="button"
              onClick={onExportPdf}
              disabled={patientCount === 0 || isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Đang Xuất PDF...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Xuất File PDF A4
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
