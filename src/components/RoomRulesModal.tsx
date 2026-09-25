import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { RoomRule } from '../types';
import { DEFAULT_ROOM_RULES, standardizeRoom } from '../utils/roomStandardizer';

interface RoomRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: RoomRule[];
  onSaveRules: (newRules: RoomRule[]) => void;
}

export const RoomRulesModal: React.FC<RoomRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSaveRules,
}) => {
  const [currentRules, setCurrentRules] = useState<RoomRule[]>(rules);
  const [testInput, setTestInput] = useState('Khu Nhiễm: Buồng dương tính 1');
  const [newPattern, setNewPattern] = useState('');
  const [newAbbr, setNewAbbr] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const testResult = standardizeRoom(testInput, currentRules);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern.trim() || !newAbbr.trim()) {
      setErrorMsg('Vui lòng nhập từ khóa/chuỗi nhận diện và ký hiệu viết tắt.');
      return;
    }

    const newRule: RoomRule = {
      id: `rule-${Date.now()}`,
      pattern: newPattern.trim(),
      abbreviation: newAbbr.trim().toUpperCase(),
      description: newDesc.trim() || `Phòng ${newAbbr.trim().toUpperCase()}`,
      isRegex: true,
    };

    const updated = [...currentRules, newRule];
    setCurrentRules(updated);
    setNewPattern('');
    setNewAbbr('');
    setNewDesc('');
    setErrorMsg('');
  };

  const handleDeleteRule = (id: string) => {
    setCurrentRules(currentRules.filter(r => r.id !== id));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Khôi phục về bảng mã chuẩn hóa phòng mặc định ban đầu?')) {
      setCurrentRules(DEFAULT_ROOM_RULES);
    }
  };

  const handleSaveAndApply = () => {
    onSaveRules(currentRules);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Bảng Quy Tắc Chuẩn Hoá Tên Phòng
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tùy biến bảng đối chiếu ký tự cột &quot;Phòng&quot; sang mã viết tắt ngắn gọn khi in thẻ.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Live Rule Tester */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Thử nghiệm chuẩn hoá trực tiếp
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  placeholder="Nhập tên phòng thử nghiệm..."
                  className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-emerald-300 focus:outline-emerald-500 font-medium"
                />
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                <span className="text-[11px] text-slate-500">Kết quả:</span>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                    testResult.isRecognized
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {testResult.normalized}
                </span>
                {testResult.isRecognized ? (
                  <span className="text-[10px] text-emerald-600 font-medium">(Đã khớp)</span>
                ) : (
                  <span className="text-[10px] text-amber-600 font-medium">(Chưa khớp)</span>
                )}
              </div>
            </div>
          </div>

          {/* Add New Rule Form */}
          <form onSubmit={handleAddRule} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Thêm quy tắc nhận diện phòng mới
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Từ khóa / Biểu thức nhận diện
                </label>
                <input
                  type="text"
                  value={newPattern}
                  onChange={e => setNewPattern(e.target.value)}
                  placeholder="vd: (cấp cứu|khoa cấp cứu|cc)"
                  className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500 font-mono"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Mã viết tắt (Hiển thị)
                </label>
                <input
                  type="text"
                  value={newAbbr}
                  onChange={e => setNewAbbr(e.target.value)}
                  placeholder="vd: CC"
                  className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500 font-bold uppercase"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tên đầy đủ / Mô tả
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Khoa Cấp cứu"
                    className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-300 focus:outline-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
            {errorMsg && (
              <div className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </div>
            )}
          </form>

          {/* Rules Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">STT</th>
                    <th className="py-2 px-3 w-24">Mã hiển thị</th>
                    <th className="py-2 px-3">Tên buồng / Khoa phòng</th>
                    <th className="py-2 px-3 font-mono text-[11px]">Từ khóa nhận diện</th>
                    <th className="py-2 px-3 w-16 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRules.map((rule, idx) => (
                    <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 text-xs">
                          {rule.abbreviation}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800">{rule.description}</td>
                      <td className="py-2 px-3 font-mono text-slate-500 text-[11px] max-w-xs truncate" title={rule.pattern}>
                        {rule.pattern}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Xóa quy tắc này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục mặc định
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Lưu & Áp Dụng Cho Thẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
