import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Patient, RoomRule } from '../types';
import { standardizeRoom } from '../utils/roomStandardizer';

interface EditPatientModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPatient: Patient) => void;
  rules: RoomRule[];
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSave,
  rules,
}) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [age, setAge] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setRoom(patient.rawRoom);
      setAge(patient.age === '—' ? '' : patient.age);
      setNotes(patient.notes || '');
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const currentStandardized = standardizeRoom(room, rules);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedName = name.trim() ? name.trim().toUpperCase() : '(CHƯA CÓ TÊN)';
    const warnings: string[] = [];

    if (!name.trim()) warnings.push('Trống họ tên bệnh nhân');
    if (!age.trim()) warnings.push('Trống thông tin tuổi/tháng');
    if (!room.trim()) warnings.push('Chưa nhập thông tin phòng');
    else if (!currentStandardized.isRecognized) {
      warnings.push(`Phòng "${room}" chưa khớp quy tắc chuẩn hóa`);
    }

    const updated: Patient = {
      ...patient,
      name: formattedName,
      rawRoom: room.trim() || '(Chưa có phòng)',
      normalizedRoom: currentStandardized.normalized,
      age: age.trim() || '—',
      notes: notes.trim(),
      warnings,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900">
            Chỉnh Sửa Thông Tin Bệnh Nhân #{patient.originalIndex || ''}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ tên bệnh nhân <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="vd: NGUYỄN VĂN AN"
              className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500 font-semibold uppercase"
            />
            <p className="text-[11px] text-slate-500 mt-1">Tự động in hoa theo quy chuẩn thẻ y tế</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tuổi / Tháng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="vd: 54 hoặc 14 tháng"
                className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã phòng chuẩn hoá
              </label>
              <div className="h-9.5 px-3 flex items-center bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-800">
                {currentStandardized.normalized}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên phòng / buồng gốc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={room}
              onChange={e => setRoom(e.target.value)}
              placeholder="vd: Khu Nội - Nhi: Hồi sức 1"
              className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] text-slate-500 mr-1 self-center">Chọn nhanh:</span>
              {rules.slice(0, 7).map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoom(r.description)}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded border border-slate-200 cursor-pointer"
                >
                  {r.abbreviation}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú thêm (tùy chọn)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="vd: Dị ứng Penicillin, Tiểu đường..."
              className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Cập Nhật Bệnh Nhân
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
