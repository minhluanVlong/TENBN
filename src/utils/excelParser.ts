import * as XLSX from 'xlsx';
import { Patient, RoomRule } from '../types';
import { standardizeRoom } from './roomStandardizer';

/**
 * Intelligent column finder
 */
function findColumnKey(row: Record<string, unknown>, possibleNames: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const name of possibleNames) {
    const found = keys.find(k => k.trim().toLowerCase() === name.toLowerCase());
    if (found) return found;
  }
  // Try substring match if exact not found
  for (const name of possibleNames) {
    const found = keys.find(k => k.trim().toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
  }
  return undefined;
}

export interface ValidationSummary {
  total: number;
  validCount: number;
  emptyNameCount: number;
  emptyAgeCount: number;
  unrecognizedRoomCount: number;
  hasErrors: boolean;
}

export function validateAndProcessPatients(
  rawList: Array<{ name?: unknown; room?: unknown; age?: unknown; notes?: unknown }>,
  rules: RoomRule[]
): { patients: Patient[]; summary: ValidationSummary } {
  let emptyNameCount = 0;
  let emptyAgeCount = 0;
  let unrecognizedRoomCount = 0;

  const patients: Patient[] = rawList.map((item, index) => {
    const rawName = String(item.name ?? '').trim();
    const rawRoom = String(item.room ?? '').trim();
    const rawAge = String(item.age ?? '').trim();
    const notes = item.notes ? String(item.notes).trim() : undefined;

    const warnings: string[] = [];

    if (!rawName) {
      emptyNameCount++;
      warnings.push('Trống họ tên bệnh nhân');
    }

    if (!rawAge) {
      emptyAgeCount++;
      warnings.push('Trống thông tin tuổi/tháng');
    }

    const { normalized, isRecognized } = standardizeRoom(rawRoom, rules);

    if (!rawRoom) {
      unrecognizedRoomCount++;
      warnings.push('Chưa nhập thông tin phòng');
    } else if (!isRecognized) {
      unrecognizedRoomCount++;
      warnings.push(`Phòng "${rawRoom}" chưa được chuẩn hoá theo quy tắc`);
    }

    // Name should be formatted to uppercase according to requirement
    const formattedName = rawName ? rawName.toUpperCase() : '(CHƯA CÓ TÊN)';

    return {
      id: `pt-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      name: formattedName,
      rawRoom: rawRoom || '(Chưa có phòng)',
      normalizedRoom: normalized,
      age: rawAge || '—',
      originalIndex: index + 1,
      warnings,
      notes,
    };
  });

  const summary: ValidationSummary = {
    total: patients.length,
    validCount: patients.filter(p => !p.warnings || p.warnings.length === 0).length,
    emptyNameCount,
    emptyAgeCount,
    unrecognizedRoomCount,
    hasErrors: emptyNameCount > 0 || emptyAgeCount > 0 || unrecognizedRoomCount > 0,
  };

  return { patients, summary };
}

export async function parseExcelFile(
  file: File,
  rules: RoomRule[]
): Promise<{ patients: Patient[]; summary: ValidationSummary; detectedSheetName: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('File Excel không có sheet nào.');
  }

  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  if (!jsonData || jsonData.length === 0) {
    throw new Error('Sheet trong file Excel trống hoặc không có dòng dữ liệu nào.');
  }

  // Detect column mapping from the first row
  const firstRow = jsonData[0];
  const nameCol = findColumnKey(firstRow, [
    'họ tên',
    'họ và tên',
    'tên bệnh nhân',
    'họ tên bệnh nhân',
    'bệnh nhân',
    'tên',
    'ho ten',
    'ho va ten',
    'patient name',
    'name',
    'full name',
  ]);

  const roomCol = findColumnKey(firstRow, [
    'phòng',
    'buồng',
    'buồng bệnh',
    'khoa phòng',
    'phòng bệnh',
    'vị trí',
    'phong',
    'buong',
    'room',
    'ward',
    'bed',
  ]);

  const ageCol = findColumnKey(firstRow, [
    'tuổi',
    'tuổi/tháng',
    'số tuổi',
    'năm sinh',
    'tuoi',
    'age',
  ]);

  const rawList = jsonData.map(row => ({
    name: nameCol ? row[nameCol] : row['Họ tên'] || row['Tên'] || Object.values(row)[0],
    room: roomCol ? row[roomCol] : row['Phòng'] || row['Buồng'] || Object.values(row)[1],
    age: ageCol ? row[ageCol] : row['Tuổi'] || Object.values(row)[2],
  }));

  const { patients, summary } = validateAndProcessPatients(rawList, rules);
  return { patients, summary, detectedSheetName: sheetName };
}

/**
 * High-quality realistic sample dataset following the prompt's departments:
 */
export const SAMPLE_PATIENTS_RAW = [
  { name: 'Nguyễn Văn An', room: 'Khu Nội - Nhi: Hồi sức 1', age: '54' },
  { name: 'Trần Thị Bích', room: 'Khu Nội - Nhi: Hồi sức 2', age: '68' },
  { name: 'Lê Hoàng Cường', room: 'Khu Nhiễm: Buồng dương tính 1', age: '42' },
  { name: 'Phạm Minh Đức', room: 'Khu Nhiễm: Buồng nghi ngờ 2', age: '35' },
  { name: 'Võ Thị Hồng', room: 'Khu Nội - Nhi: Buồng bệnh 1', age: '29' },
  { name: 'Đặng Quốc Hưng', room: 'Khu Nội - Nhi: Buồng bệnh 1', age: '63' },
  { name: 'Bùi Thanh Khiêm', room: 'Khu Nội - Nhi: Buồng bệnh 2', age: '47' },
  { name: 'Hoàng Thị Lan', room: 'Khu Nội - Nhi: Buồng bệnh 2', age: '51' },
  { name: 'Đỗ Văn Long', room: 'Khu Nội - Nhi: Buồng bệnh 3', age: '38' },
  { name: 'Ngô Mỹ Linh', room: 'Khu Nội - Nhi: Buồng bệnh 3', age: '24' },
  { name: 'Dương Đình Nam', room: 'Khu Nội - Nhi: Buồng bệnh 4', age: '70' },
  { name: 'Lý Ngọc Mai', room: 'Khu Nội - Nhi: Buồng bệnh 4', age: '33' },
  { name: 'Vũ Hữu Nghĩa', room: 'Khu Nội - Nhi: Buồng bệnh 5', age: '59' },
  { name: 'Trịnh Thị Oanh', room: 'Khu Nội - Nhi: Buồng Lão khoa', age: '86' },
  { name: 'Đào Quang Phúc', room: 'Khu Nội - Nhi: Buồng Lão khoa', age: '91' },
  { name: 'Mai Văn Quân', room: 'Khu Nội - Nhi: Buồng Lão khoa', age: '78' },
  { name: 'Hồ Gia Bảo', room: 'Khu Nội - Nhi: Buồng Nhi 1', age: '14 tháng' },
  { name: 'Chu Quỳnh Nhi', room: 'Khu Nội - Nhi: Buồng Nhi 1', age: '3 tuổi' },
  { name: 'Tạ Minh Khang', room: 'Khu Nội - Nhi: Buồng Nhi 2', age: '5 tuổi' },
  { name: 'Lâm Tuệ Mẫn', room: 'Khu Nội - Nhi: Buồng Nhi 2', age: '8 tháng' },
  { name: 'Phan Bá Sang', room: 'Phòng mổ / Hậu phẫu sản khoa', age: '31' },
  { name: 'Nguyễn Tấn Tài', room: 'Phòng mổ / Hậu phẫu ngoại khoa', age: '45' },
  { name: 'Lương Ánh Tuyết', room: 'Khu Nhiễm: Buồng bệnh cách ly', age: '27' },
  { name: 'Vương Đình Tùng', room: 'Khu Nội - Nhi: Buồng bệnh 5', age: '62' },
];

export function downloadSampleExcelFile() {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_PATIENTS_RAW);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Phat_Thuoc');
  XLSX.writeFile(wb, 'Mau_Danh_Sach_Benh_Nhan_Phat_Thuoc.xlsx');
}
