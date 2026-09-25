import React from 'react';
import { AlertTriangle, CheckCircle2, UserX, Clock, HelpCircle, Layers, SlidersHorizontal } from 'lucide-react';
import { ValidationSummary } from '../utils/excelParser';

interface ValidationBannerProps {
  summary: ValidationSummary;
  filterMode: 'all' | 'warning' | 'valid';
  onFilterChange: (mode: 'all' | 'warning' | 'valid') => void;
  onOpenRules: () => void;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  summary,
  filterMode,
  onFilterChange,
  onOpenRules,
}) => {
  if (summary.total === 0) return null;

  return (
    <div className="no-print space-y-3">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total */}
        <div
          onClick={() => onFilterChange('all')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            filterMode === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium opacity-80">Tổng bệnh nhân</span>
            <Layers className="w-4 h-4 opacity-70" />
          </div>
          <div className="mt-1 text-2xl font-bold">{summary.total}</div>
          <div className="text-[11px] opacity-75 mt-0.5">Tìm thấy từ dữ liệu</div>
        </div>

        {/* Valid Ready */}
        <div
          onClick={() => onFilterChange('valid')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            filterMode === 'valid'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium opacity-80">Đầy đủ hợp lệ</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{summary.validCount}</div>
          <div className="text-[11px] opacity-75 mt-0.5">Sẵn sàng in thẻ</div>
        </div>

        {/* Unrecognized Room */}
        <div
          onClick={() => {
            if (summary.unrecognizedRoomCount > 0) onFilterChange('warning');
          }}
          className={`p-3.5 rounded-xl border transition-all ${
            summary.unrecognizedRoomCount > 0
              ? 'bg-amber-50/70 border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100/70'
              : 'bg-white text-slate-800 border-slate-200 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Chưa chuẩn hóa phòng</span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-700">
            {summary.unrecognizedRoomCount}
          </div>
          <div className="text-[11px] text-amber-800/80 mt-0.5">Cần đối chiếu mã</div>
        </div>

        {/* Empty Name / Age */}
        <div
          onClick={() => {
            if (summary.emptyNameCount > 0 || summary.emptyAgeCount > 0) onFilterChange('warning');
          }}
          className={`p-3.5 rounded-xl border transition-all ${
            summary.emptyNameCount > 0 || summary.emptyAgeCount > 0
              ? 'bg-rose-50/70 border-rose-200 text-rose-900 cursor-pointer hover:bg-rose-100/70'
              : 'bg-white text-slate-800 border-slate-200 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Trống Tên / Tuổi</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-1 text-2xl font-bold text-rose-600">
            {summary.emptyNameCount + summary.emptyAgeCount}
          </div>
          <div className="text-[11px] text-rose-800/80 mt-0.5">
            {summary.emptyNameCount} tên, {summary.emptyAgeCount} tuổi
          </div>
        </div>
      </div>

      {/* Warning Notice If Any Errors */}
      {summary.hasErrors && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-900">
                Phát hiện thông tin cần kiểm tra trước khi in:
              </div>
              <ul className="text-xs text-amber-800 mt-1 space-y-0.5 list-disc list-inside">
                {summary.emptyNameCount > 0 && (
                  <li>Có <strong>{summary.emptyNameCount}</strong> dòng bị trống Họ tên bệnh nhân.</li>
                )}
                {summary.emptyAgeCount > 0 && (
                  <li>Có <strong>{summary.emptyAgeCount}</strong> dòng bị trống Tuổi hoặc Tháng.</li>
                )}
                {summary.unrecognizedRoomCount > 0 && (
                  <li>
                    Có <strong>{summary.unrecognizedRoomCount}</strong> bệnh nhân có tên phòng chưa khớp bảng mã quy tắc.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => onFilterChange('warning')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                filterMode === 'warning'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              Lọc danh sách cảnh báo
            </button>
            <button
              type="button"
              onClick={onOpenRules}
              className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              Sửa quy tắc phòng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
