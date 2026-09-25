import React, { useState } from 'react';
import { Search, Edit3, Trash2, Plus, ArrowUpDown, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Patient, RoomRule } from '../types';

interface PatientTableProps {
  patients: Patient[];
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onAddPatient: () => void;
  onClearAll: () => void;
  rules: RoomRule[];
  filterMode: 'all' | 'warning' | 'valid';
  sortBy: 'none' | 'room' | 'name';
  onSortChange: (sort: 'none' | 'room' | 'name') => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  onEditPatient,
  onDeletePatient,
  onAddPatient,
  onClearAll,
  rules,
  filterMode,
  sortBy,
  onSortChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('ALL');

  // Extract unique normalized rooms for filter tabs
  const roomBadges = Array.from(new Set(patients.map(p => p.normalizedRoom))).filter(Boolean);

  // Filter logic
  let filtered = patients.filter(patient => {
    // Search query
    const matchSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.normalizedRoom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.rawRoom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.age.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    // Filter mode
    if (filterMode === 'warning') {
      return patient.warnings && patient.warnings.length > 0;
    }
    if (filterMode === 'valid') {
      return !patient.warnings || patient.warnings.length === 0;
    }

    // Room tab filter
    if (selectedRoomFilter !== 'ALL') {
      return patient.normalizedRoom === selectedRoomFilter;
    }

    return true;
  });

  // Sort logic
  if (sortBy === 'room') {
    filtered = [...filtered].sort((a, b) => a.normalizedRoom.localeCompare(b.normalizedRoom));
  } else if (sortBy === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Danh Sách Bệnh Nhân Chia Thuốc</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {filtered.length} / {patients.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem trước thông tin đã chuẩn hóa và kiểm tra cảnh báo trước khi xuất file in.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm tên, phòng, tuổi..."
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500 w-44 sm:w-56"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 text-xs">
            <span className="px-2 text-slate-500 flex items-center gap-1 text-[11px] font-medium">
              <ArrowUpDown className="w-3 h-3" /> Xếp:
            </span>
            <button
              type="button"
              onClick={() => onSortChange('none')}
              className={`px-2 py-1 rounded cursor-pointer font-medium ${
                sortBy === 'none' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Gốc
            </button>
            <button
              type="button"
              onClick={() => onSortChange('room')}
              className={`px-2 py-1 rounded cursor-pointer font-medium ${
                sortBy === 'room' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Gom các bệnh nhân cùng phòng lại với nhau để dễ chia thuốc"
            >
              Theo Phòng
            </button>
            <button
              type="button"
              onClick={() => onSortChange('name')}
              className={`px-2 py-1 rounded cursor-pointer font-medium ${
                sortBy === 'name' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tên A-Z
            </button>
          </div>

          {/* Add patient button */}
          <button
            type="button"
            onClick={onAddPatient}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm Bệnh Nhân
          </button>

          {/* Clear button */}
          {patients.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa toàn bộ danh sách"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Room Quick Filter Pills */}
      {roomBadges.length > 1 && (
        <div className="px-4 sm:px-6 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Lọc phòng:
          </span>
          <button
            type="button"
            onClick={() => setSelectedRoomFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 cursor-pointer ${
              selectedRoomFilter === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất cả ({patients.length})
          </button>
          {roomBadges.map(room => {
            const count = patients.filter(p => p.normalizedRoom === room).length;
            const isSelected = selectedRoomFilter === room;
            return (
              <button
                key={room}
                type="button"
                onClick={() => setSelectedRoomFilter(room)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono shrink-0 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {room} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[380px] custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200 font-semibold">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">STT</th>
              <th className="py-2.5 px-3">Tên Bệnh Nhân (IN HOA)</th>
              <th className="py-2.5 px-3 w-28">Tuổi / Tháng</th>
              <th className="py-2.5 px-3 w-32">Mã Phòng Chuẩn Hóa</th>
              <th className="py-2.5 px-3">Tên Buồng / Phòng Gốc</th>
              <th className="py-2.5 px-3 w-40">Trạng Thái</th>
              <th className="py-2.5 px-3 w-20 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Không tìm thấy bệnh nhân nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filtered.map((patient, idx) => {
                const hasWarning = patient.warnings && patient.warnings.length > 0;
                return (
                  <tr
                    key={patient.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      hasWarning ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 uppercase tracking-tight">
                        {patient.name}
                      </div>
                      {patient.notes && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5">{patient.notes}</div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {patient.age || '—'}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold font-mono bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {patient.normalizedRoom}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate" title={patient.rawRoom}>
                      {patient.rawRoom}
                    </td>

                    <td className="py-2.5 px-3">
                      {hasWarning ? (
                        <div className="flex flex-col gap-0.5">
                          {patient.warnings?.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              {w}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hợp lệ
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditPatient(patient)}
                          className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePatient(patient.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Xóa bệnh nhân này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
