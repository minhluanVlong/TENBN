/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DataUploader } from './components/DataUploader';
import { ValidationBanner } from './components/ValidationBanner';
import { PatientTable } from './components/PatientTable';
import { PrintPreview } from './components/PrintPreview';
import { RoomRulesModal } from './components/RoomRulesModal';
import { EditPatientModal } from './components/EditPatientModal';
import { Patient, RoomRule, PrintSettings } from './types';
import { DEFAULT_ROOM_RULES } from './utils/roomStandardizer';
import {
  validateAndProcessPatients,
  SAMPLE_PATIENTS_RAW,
  downloadSampleExcelFile,
  ValidationSummary,
} from './utils/excelParser';
import { generateA4Pdf } from './utils/pdfGenerator';
import { SlidersHorizontal, FileText, CheckCircle2, LayoutGrid, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_RULES_KEY = 'rx_room_rules_v1';

export default function App() {
  // 1. Room Rules State
  const [rules, setRules] = useState<RoomRule[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RULES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_ROOM_RULES;
  });

  // 2. Patients & Validation State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [summary, setSummary] = useState<ValidationSummary>({
    total: 0,
    validCount: 0,
    emptyNameCount: 0,
    emptyAgeCount: 0,
    unrecognizedRoomCount: 0,
    hasErrors: false,
  });

  // 3. Print & Layout Settings
  const [settings, setSettings] = useState<PrintSettings>({
    gridRows: 8, // 3 x 8 = 24 cards/page (or 7 = 21 cards)
    gridCols: 3,
    marginMm: 8,
    cardBorderColor: '#16a34a', // Medical green
    cardBorderStyle: 'solid',
    fontSizePt: 12,
    nameFontScale: 'large', // Display patient name in prominent large font
    showRoomOriginal: false,
    showDate: false,
    dateStr: new Date().toLocaleDateString('vi-VN'),
    showShift: false,
    shiftStr: 'SÁNG',
    hospitalName: 'Trung Tâm Y Tế',
    departmentName: 'Khoa Nội - Nhi',
    sortBy: 'none',
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'preview' | 'data'>('preview');
  const [filterMode, setFilterMode] = useState<'all' | 'warning' | 'valid'>('all');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load sample dataset on initial mount so user has immediate preview
  useEffect(() => {
    const { patients: initialPatients, summary: initialSummary } = validateAndProcessPatients(
      SAMPLE_PATIENTS_RAW,
      rules
    );
    setPatients(initialPatients);
    setSummary(initialSummary);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-run standardization whenever rules change
  const handleSaveRules = (newRules: RoomRule[]) => {
    setRules(newRules);
    try {
      localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(newRules));
    } catch {
      // ignore
    }

    // Re-standardize all existing patients
    const rawList = patients.map(p => ({
      name: p.name,
      room: p.rawRoom,
      age: p.age,
      notes: p.notes,
    }));
    const { patients: updatedPatients, summary: updatedSummary } = validateAndProcessPatients(
      rawList,
      newRules
    );
    setPatients(updatedPatients);
    setSummary(updatedSummary);
    showToast('Đã cập nhật bảng quy tắc chuẩn hóa phòng!');
  };

  // Handle file/paste data loaded
  const handleDataLoaded = (
    newPatients: Patient[],
    newSummary: ValidationSummary,
    sourceName: string
  ) => {
    setPatients(newPatients);
    setSummary(newSummary);
    setFilterMode(newSummary.hasErrors ? 'warning' : 'all');
    showToast(`Đã nạp ${newPatients.length} bệnh nhân từ "${sourceName}"`);
  };

  // Load sample data
  const handleLoadSample = () => {
    const { patients: sampleList, summary: sampleSummary } = validateAndProcessPatients(
      SAMPLE_PATIENTS_RAW,
      rules
    );
    setPatients(sampleList);
    setSummary(sampleSummary);
    showToast('Đã nạp 24 bệnh nhân mẫu thuộc các khoa phòng!');
  };

  // Update print settings
  const handleUpdateSettings = (newSettings: Partial<PrintSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Edit patient
  const handleSavePatient = (updated: Patient) => {
    const updatedList = patients.map(p => (p.id === updated.id ? updated : p));
    setPatients(updatedList);

    // Recompute summary
    const emptyNameCount = updatedList.filter(p => !p.name || p.name === '(CHƯA CÓ TÊN)').length;
    const emptyAgeCount = updatedList.filter(p => !p.age || p.age === '—').length;
    const unrecognizedRoomCount = updatedList.filter(
      p => p.warnings && p.warnings.some(w => w.includes('chuẩn hóa') || w.includes('nhập'))
    ).length;
    const validCount = updatedList.filter(p => !p.warnings || p.warnings.length === 0).length;

    setSummary({
      total: updatedList.length,
      validCount,
      emptyNameCount,
      emptyAgeCount,
      unrecognizedRoomCount,
      hasErrors: emptyNameCount > 0 || emptyAgeCount > 0 || unrecognizedRoomCount > 0,
    });
    showToast('Đã cập nhật thông tin bệnh nhân!');
  };

  // Add single patient manually
  const handleAddPatient = () => {
    const newPt: Patient = {
      id: `pt-${Date.now()}`,
      name: '',
      rawRoom: '',
      normalizedRoom: 'Chưa có phòng',
      age: '',
      originalIndex: patients.length + 1,
      warnings: ['Trống họ tên bệnh nhân', 'Trống thông tin tuổi/tháng', 'Chưa nhập thông tin phòng'],
    };
    setEditingPatient(newPt);
  };

  // Delete patient
  const handleDeletePatient = (id: string) => {
    const remaining = patients.filter(p => p.id !== id);
    setPatients(remaining);
    const validCount = remaining.filter(p => !p.warnings || p.warnings.length === 0).length;
    setSummary(prev => ({
      ...prev,
      total: remaining.length,
      validCount,
    }));
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách bệnh nhân hiện tại?')) {
      setPatients([]);
      setSummary({
        total: 0,
        validCount: 0,
        emptyNameCount: 0,
        emptyAgeCount: 0,
        unrecognizedRoomCount: 0,
        hasErrors: false,
      });
      showToast('Đã làm trống danh sách bệnh nhân.');
    }
  };

  // Direct Browser Print
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Export via jsPDF
  const handleExportPdf = async () => {
    if (patients.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      // Sort patients for printing if sort setting selected
      let printList = [...patients];
      if (settings.sortBy === 'room') {
        printList.sort((a, b) => a.normalizedRoom.localeCompare(b.normalizedRoom));
      } else if (settings.sortBy === 'name') {
        printList.sort((a, b) => a.name.localeCompare(b.name));
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `The_Phat_Thuoc_A4_${dateStr}_${printList.length}BN.pdf`;
      await generateA4Pdf(printList, settings, filename);
      showToast('Xuất file PDF chuẩn A4 thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tạo PDF.';
      alert(`Không thể tạo PDF: ${msg}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Sort change
  const handleSortChange = (sort: 'none' | 'room' | 'name') => {
    handleUpdateSettings({ sortBy: sort });
  };

  // Filtered patients according to sort
  let displayPatients = [...patients];
  if (settings.sortBy === 'room') {
    displayPatients.sort((a, b) => a.normalizedRoom.localeCompare(b.normalizedRoom));
  } else if (settings.sortBy === 'name') {
    displayPatients.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* App Header */}
      <Header
        onLoadSample={handleLoadSample}
        onDownloadSample={downloadSampleExcelFile}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        isGeneratingPdf={isGeneratingPdf}
        patientCount={patients.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Step 1: Upload Excel & Quick Load */}
        <DataUploader
          onDataLoaded={handleDataLoaded}
          rules={rules}
          onLoadSample={handleLoadSample}
          onDownloadSample={downloadSampleExcelFile}
        />

        {/* Step 1 Validation Summary & Alerts */}
        <ValidationBanner
          summary={summary}
          filterMode={filterMode}
          onFilterChange={setFilterMode}
          onOpenRules={() => setIsRulesModalOpen(true)}
        />

        {/* Tab Controls & View Mode */}
        {patients.length > 0 && (
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl w-fit border border-slate-300/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-emerald-600" />
                Mẫu In Thẻ A4 ({settings.gridRows === 8 ? '24 thẻ/trang' : '21 thẻ/trang'})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'data'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-600" />
                Danh Sách & Chuẩn Hóa ({patients.length})
                {summary.hasErrors && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            </div>

            {/* Quick Rules trigger button */}
            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              Cấu hình bảng mã phòng ({rules.length} quy tắc)
            </button>
          </div>
        )}

        {/* Tab 1: Live A4 Print Sheet Preview */}
        {activeTab === 'preview' && (
          <PrintPreview
            patients={displayPatients}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onPrint={handlePrint}
            onExportPdf={handleExportPdf}
            isGeneratingPdf={isGeneratingPdf}
          />
        )}

        {/* Tab 2: Detailed Patient Data Table */}
        {activeTab === 'data' && (
          <PatientTable
            patients={patients}
            onEditPatient={pt => setEditingPatient(pt)}
            onDeletePatient={handleDeletePatient}
            onAddPatient={handleAddPatient}
            onClearAll={handleClearAll}
            rules={rules}
            filterMode={filterMode}
            sortBy={settings.sortBy}
            onSortChange={handleSortChange}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="no-print mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Trợ Lý Y Tế • Hỗ trợ in mẫu thẻ chia phát thuốc nội trú chuẩn khổ giấy A4</span>
          <span className="font-mono text-slate-400">
            Quy chuẩn: 3 cột x {settings.gridRows} hàng • Lề {settings.marginMm}mm • Viền định vị cắt kéo
          </span>
        </div>
      </footer>

      {/* Rules Modal */}
      <RoomRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        onSaveRules={handleSaveRules}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        patient={editingPatient}
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        onSave={handleSavePatient}
        rules={rules}
      />
    </div>
  );
}
