import React, { useState } from 'react';
import {
  Printer,
  Download,
  Settings2,
  ZoomIn,
  ZoomOut,
  Scissors,
  Check,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Clock,
} from 'lucide-react';
import { Patient, PrintSettings } from '../types';

interface PrintPreviewProps {
  patients: Patient[];
  settings: PrintSettings;
  onUpdateSettings: (newSettings: Partial<PrintSettings>) => void;
  onPrint: () => void;
  onExportPdf: () => void;
  isGeneratingPdf: boolean;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({
  patients,
  settings,
  onUpdateSettings,
  onPrint,
  onExportPdf,
  isGeneratingPdf,
}) => {
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [activePage, setActivePage] = useState<number>(0);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  const cardsPerPage = settings.gridCols * settings.gridRows; // 21 or 24
  const totalPages = Math.max(1, Math.ceil(patients.length / cardsPerPage));

  // Chunk patients by page
  const pages: Patient[][] = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(patients.slice(i * cardsPerPage, (i + 1) * cardsPerPage));
  }

  // Border style class
  const getBorderClass = () => {
    switch (settings.cardBorderStyle) {
      case 'dashed':
        return 'border-dashed border-[1.5px]';
      case 'dotted':
        return 'border-dotted border-[2px]';
      default:
        return 'border-solid border-[1.5px]';
    }
  };

  // Full Patient Name font size (Pt), automatically fits long names cleanly without cutting off
  const getPatientNameFontSizePt = (name: string) => {
    const base = settings.fontSizePt || 12;
    let multiplier = 1.38;
    if (settings.nameFontScale === 'xlarge') multiplier = 1.55;
    if (settings.nameFontScale === 'normal') multiplier = 1.18;

    let pt = base * multiplier;
    const len = name.length;
    if (len > 27) pt *= 0.78;
    else if (len > 22) pt *= 0.86;
    else if (len > 18) pt *= 0.93;
    return pt;
  };

  return (
    <div className="space-y-4">
      {/* Print Controls Bar (Screen Only) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Xem Trước Trang In Chuẩn A4
                <span className="text-xs font-normal text-slate-500">
                  ({patients.length} thẻ • {totalPages} trang A4)
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Lưới {settings.gridCols} cột x {settings.gridRows} hàng ({cardsPerPage} thẻ/trang). Cắt kéo theo đường viền xanh.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Layout switch 24 vs 21 */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium border border-slate-200">
              <button
                type="button"
                onClick={() => onUpdateSettings({ gridRows: 8 })}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  settings.gridRows === 8
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                24 thẻ (3x8)
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ gridRows: 7 })}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  settings.gridRows === 7
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                21 thẻ (3x7)
              </button>
            </div>

            {/* Quick Name Font Size Switcher */}
            <div className="flex items-center bg-emerald-50 rounded-lg p-0.5 text-xs font-medium border border-emerald-200">
              <span className="px-2 text-[11px] font-bold text-emerald-800">Cỡ Tên:</span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ nameFontScale: 'normal' })}
                className={`px-2 py-1 rounded cursor-pointer text-[11px] font-bold ${
                  settings.nameFontScale === 'normal'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Vừa
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ nameFontScale: 'large' })}
                className={`px-2 py-1 rounded cursor-pointer text-[11px] font-bold ${
                  settings.nameFontScale === 'large'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-emerald-800 hover:bg-emerald-100'
                }`}
                title="Cỡ chữ tên lớn, dễ nhìn từ xa khi chia thuốc (khuyên dùng)"
              >
                Lớn ★
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ nameFontScale: 'xlarge' })}
                className={`px-2 py-1 rounded cursor-pointer text-[11px] font-bold ${
                  settings.nameFontScale === 'xlarge'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-emerald-800 hover:bg-emerald-100'
                }`}
                title="Cỡ chữ tên cực đại"
              >
                Rất lớn
              </button>
            </div>

            {/* Toggle drawer settings */}
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                showSettingsDrawer
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Tùy biến nhãn in
            </button>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 text-xs border border-slate-200">
              <button
                type="button"
                onClick={() => setZoomScale(Math.max(0.4, zoomScale - 0.1))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[11px] font-mono text-slate-700">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print & PDF Buttons */}
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-2xs cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              In Ngay
            </button>

            <button
              type="button"
              onClick={onExportPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất PDF A4
            </button>
          </div>
        </div>

        {/* Extended Settings Drawer */}
        {showSettingsDrawer && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 animate-in fade-in duration-150">
            {/* Cỡ chữ Tên Bệnh Nhân */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Cỡ chữ Tên Bệnh Nhân
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { key: 'normal', label: 'Vừa' },
                    { key: 'large', label: 'Lớn ★' },
                    { key: 'xlarge', label: 'Rất lớn' },
                  ] as const
                ).map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onUpdateSettings({ nameFontScale: item.key })}
                    className={`px-1.5 py-1 text-xs rounded border cursor-pointer font-bold ${
                      settings.nameFontScale === item.key
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Viền thẻ */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Kiểu đường viền cắt kéo
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['solid', 'dashed', 'dotted'] as const).map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onUpdateSettings({ cardBorderStyle: style })}
                    className={`px-2 py-1 text-xs rounded border capitalize cursor-pointer font-medium ${
                      settings.cardBorderStyle === style
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {style === 'solid' ? 'Nét liền' : style === 'dashed' ? 'Nét đứt' : 'Chấm chấm'}
                  </button>
                ))}
              </div>
            </div>

            {/* Màu viền thẻ */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Màu viền thẻ
              </label>
              <div className="flex items-center gap-2">
                {[
                  { color: '#16a34a', label: 'Xanh y tế' },
                  { color: '#059669', label: 'Ngọc lục' },
                  { color: '#0284c7', label: 'Xanh dương' },
                  { color: '#475569', label: 'Xám đậm' },
                ].map(c => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => onUpdateSettings({ cardBorderColor: c.color })}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-transform cursor-pointer ${
                      settings.cardBorderColor === c.color ? 'border-slate-800 scale-110 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  >
                    {settings.cardBorderColor === c.color && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cỡ chữ cơ sở */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Cỡ chữ chung ({settings.fontSizePt}pt)
              </label>
              <div className="flex items-center gap-2">
                {[11, 12, 13].map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => onUpdateSettings({ fontSizePt: pt })}
                    className={`px-2.5 py-1 text-xs rounded border cursor-pointer font-medium ${
                      settings.fontSizePt === pt
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {pt} pt
                  </button>
                ))}
              </div>
            </div>

            {/* Buổi phát thuốc / Đối chiếu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Kèm buổi phát thuốc
              </label>
              <div className="flex items-center gap-1">
                {['SÁNG', 'TRƯA', 'CHIỀU', 'TỐI'].map(shift => {
                  const isCur = settings.showShift && settings.shiftStr === shift;
                  return (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => {
                        if (isCur) {
                          onUpdateSettings({ showShift: false, shiftStr: '' });
                        } else {
                          onUpdateSettings({ showShift: true, shiftStr: shift });
                        }
                      }}
                      className={`px-2 py-1 text-[11px] rounded border cursor-pointer font-bold ${
                        isCur
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {shift}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page Selector Bar (If multi-page) */}
      {totalPages > 1 && (
        <div className="no-print flex items-center justify-center gap-3 py-1">
          <button
            type="button"
            disabled={activePage === 0}
            onClick={() => setActivePage(Math.max(0, activePage - 1))}
            className="p-1 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span>Trang {activePage + 1} / {totalPages}</span>
            <span className="text-slate-400 font-normal">
              ({pages[activePage]?.length || 0} thẻ)
            </span>
          </div>
          <button
            type="button"
            disabled={activePage >= totalPages - 1}
            onClick={() => setActivePage(Math.min(totalPages - 1, activePage + 1))}
            className="p-1 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* The Printable A4 Container */}
      <div className="printable-area flex flex-col items-center justify-center overflow-x-auto pb-10">
        {pages.map((pagePatients, pageIdx) => {
          // On screen, only display the active page if multi-page to reduce lag,
          // BUT in print mode, all pages will be printed automatically!
          const isHiddenOnScreen = totalPages > 1 && pageIdx !== activePage;

          return (
            <div
              key={pageIdx}
              className={`print-page bg-white shadow-xl rounded-md transition-transform origin-top mb-8 ${
                isHiddenOnScreen ? 'hidden print:block' : 'block'
              }`}
              style={{
                width: '210mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                padding: `${settings.marginMm}mm`,
                transform: `scale(${zoomScale})`,
                boxSizing: 'border-box',
              }}
            >
              {/* Grid Layout of Cards */}
              <div
                className="w-full h-full grid gap-[2mm]"
                style={{
                  gridTemplateColumns: `repeat(${settings.gridCols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${settings.gridRows}, minmax(0, 1fr))`,
                  height: `calc(297mm - ${settings.marginMm * 2}mm)`,
                }}
              >
                {pagePatients.map((patient, pIdx) => {
                  return (
                    <div
                      key={patient.id || pIdx}
                      className={`card-item relative rounded-[3px] p-[2.5mm] flex flex-col justify-between bg-white text-slate-900 transition-colors ${getBorderClass()}`}
                      style={{
                        borderColor: settings.cardBorderColor || '#16a34a',
                        height: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Dòng 1: TÊN: [HỌ TÊN ĐẦY ĐỦ BỆNH NHÂN IN HOA] - Trọn vẹn bề ngang không bị cắt */}
                      <div className="flex items-baseline gap-1.5 overflow-hidden leading-tight">
                        <span
                          className="font-bold text-slate-500 tracking-wider shrink-0"
                          style={{ fontSize: `${settings.fontSizePt * 0.78}pt` }}
                        >
                          TÊN:
                        </span>
                        <span
                          className="font-black text-emerald-950 uppercase tracking-tight flex-1 truncate leading-tight"
                          style={{ fontSize: `${getPatientNameFontSizePt(patient.name)}pt` }}
                          title={patient.name}
                        >
                          {patient.name}
                        </span>
                      </div>

                      {/* Dòng 2: PHÒNG (Bên trái) VÀ TUỔI (Bên phải cùng hàng) */}
                      <div className="flex items-baseline justify-between gap-1 mt-auto pt-1 leading-none">
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <span
                            className="font-bold text-slate-500 tracking-wider shrink-0"
                            style={{ fontSize: `${settings.fontSizePt * 0.78}pt` }}
                          >
                            PHÒNG:
                          </span>
                          <span
                            className="font-black text-slate-950 tracking-tight"
                            style={{ fontSize: `${settings.fontSizePt * 1.25}pt` }}
                          >
                            {patient.normalizedRoom}
                          </span>

                          {settings.showRoomOriginal &&
                            patient.rawRoom &&
                            patient.rawRoom !== patient.normalizedRoom && (
                              <span
                                className="text-slate-400 font-normal italic truncate text-[8.5pt]"
                                title={patient.rawRoom}
                              >
                                ({patient.rawRoom})
                              </span>
                            )}
                        </div>

                        <div className="shrink-0 flex items-baseline gap-1.5 pl-1">
                          <div className="flex items-baseline gap-1">
                            <span
                              className="font-bold text-slate-500 tracking-wider"
                              style={{ fontSize: `${settings.fontSizePt * 0.78}pt` }}
                            >
                              TUỔI:
                            </span>
                            <span
                              className="font-black text-slate-950"
                              style={{ fontSize: `${settings.fontSizePt * 1.05}pt` }}
                            >
                              {patient.age || '—'}
                            </span>
                          </div>

                          {settings.showShift && settings.shiftStr && (
                            <div
                              className="px-1 py-0.5 rounded font-bold text-emerald-800 bg-emerald-50 border border-emerald-200"
                              style={{ fontSize: `${settings.fontSizePt * 0.68}pt` }}
                            >
                              {settings.shiftStr}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Fill empty card slots on last page to keep consistent grid aesthetic */}
                {pagePatients.length < cardsPerPage &&
                  Array.from({ length: cardsPerPage - pagePatients.length }).map((_, emptyIdx) => (
                    <div
                      key={`empty-${emptyIdx}`}
                      className="card-item relative rounded-[3px] border border-dashed border-slate-200 p-[2.5mm] flex items-center justify-center text-slate-300 text-[10px]"
                      style={{ height: '100%' }}
                    >
                      <span className="opacity-40 italic">Ô trống dự phòng</span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
