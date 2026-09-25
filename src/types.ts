export interface Patient {
  id: string;
  name: string;
  rawRoom: string;
  normalizedRoom: string;
  age: string;
  originalIndex?: number;
  warnings?: string[];
  notes?: string;
  shift?: string; // Sáng / Trưa / Chiều / Tối
}

export interface RoomRule {
  id: string;
  pattern: string; // Regex string or keyword
  abbreviation: string; // e.g. KL, HS, P1, PM
  description: string;
  isRegex?: boolean;
}

export interface PrintSettings {
  gridRows: 7 | 8; // 7 rows (21 cards) or 8 rows (24 cards)
  gridCols: 3;
  marginMm: number; // 8 - 10 mm
  cardBorderColor: string; // e.g. #16a34a (Green)
  cardBorderStyle: 'solid' | 'dashed' | 'dotted';
  fontSizePt: number; // 11 - 13 pt
  nameFontScale: 'normal' | 'large' | 'xlarge'; // Font size multiplier for patient name
  showRoomOriginal: boolean;
  showDate: boolean;
  dateStr: string;
  showShift: boolean;
  shiftStr: string;
  hospitalName: string;
  departmentName: string;
  sortBy: 'none' | 'room' | 'name';
}
