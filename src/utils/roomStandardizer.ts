import { RoomRule } from '../types';

export const DEFAULT_ROOM_RULES: RoomRule[] = [
  {
    id: 'rule-kl',
    pattern: '(nhiễm|dương tính|nghi ngờ|khu lây|lây nhiễm|cách ly)',
    abbreviation: 'KL',
    description: 'Khu Nhiễm / Buồng dương tính / Nghi ngờ',
    isRegex: true,
  },
  {
    id: 'rule-hs2',
    pattern: '(hồi sức 2|hồi sức cấp cứu 2|hs 2|hs2)',
    abbreviation: 'HS2',
    description: 'Khu Nội - Nhi: Hồi sức 2',
    isRegex: true,
  },
  {
    id: 'rule-hs1',
    pattern: '(hồi sức 1|hồi sức cấp cứu 1|hs 1|hs1|hồi sức tích cực|hồi sức)',
    abbreviation: 'HS',
    description: 'Khu Nội - Nhi: Hồi sức 1',
    isRegex: true,
  },
  {
    id: 'rule-p1',
    pattern: '(buồng bệnh 1|buồng 1|phòng 1|p\\.1|^p1$)',
    abbreviation: 'P1',
    description: 'Khu Nội - Nhi: Buồng bệnh 1',
    isRegex: true,
  },
  {
    id: 'rule-p2',
    pattern: '(buồng bệnh 2|buồng 2|phòng 2|p\\.2|^p2$)',
    abbreviation: 'P2',
    description: 'Khu Nội - Nhi: Buồng bệnh 2',
    isRegex: true,
  },
  {
    id: 'rule-p3',
    pattern: '(buồng bệnh 3|buồng 3|phòng 3|p\\.3|^p3$)',
    abbreviation: 'P3',
    description: 'Khu Nội - Nhi: Buồng bệnh 3',
    isRegex: true,
  },
  {
    id: 'rule-p4',
    pattern: '(buồng bệnh 4|buồng 4|phòng 4|p\\.4|^p4$)',
    abbreviation: 'P4',
    description: 'Khu Nội - Nhi: Buồng bệnh 4',
    isRegex: true,
  },
  {
    id: 'rule-p5',
    pattern: '(buồng bệnh 5|buồng 5|phòng 5|p\\.5|^p5$)',
    abbreviation: 'P5',
    description: 'Khu Nội - Nhi: Buồng bệnh 5',
    isRegex: true,
  },
  {
    id: 'rule-lk',
    pattern: '(lão khoa|người cao tuổi|^lk$)',
    abbreviation: 'LK',
    description: 'Khu Nội - Nhi: Buồng Lão khoa',
    isRegex: true,
  },
  {
    id: 'rule-n1',
    pattern: '(buồng nhi 1|nhi 1|n\\.1|^n1$)',
    abbreviation: 'N1',
    description: 'Khu Nội - Nhi: Buồng Nhi 1',
    isRegex: true,
  },
  {
    id: 'rule-n2',
    pattern: '(buồng nhi 2|nhi 2|n\\.2|^n2$)',
    abbreviation: 'N2',
    description: 'Khu Nội - Nhi: Buồng Nhi 2',
    isRegex: true,
  },
  {
    id: 'rule-pm',
    pattern: '(phòng mổ|hậu phẫu|phẫu thuật|^pm$)',
    abbreviation: 'PM',
    description: 'Phòng mổ / Hậu phẫu',
    isRegex: true,
  },
];

/**
 * Standardize room name based on rules
 */
export function standardizeRoom(rawRoom: string, rules: RoomRule[]): {
  normalized: string;
  matchedRule?: RoomRule;
  isRecognized: boolean;
} {
  if (!rawRoom || !rawRoom.trim()) {
    return {
      normalized: 'Chưa có phòng',
      isRecognized: false,
    };
  }

  const clean = rawRoom.trim();
  const lower = clean.toLowerCase();

  // First check if already exact abbreviation (case-insensitive)
  for (const rule of rules) {
    if (lower === rule.abbreviation.toLowerCase()) {
      return {
        normalized: rule.abbreviation,
        matchedRule: rule,
        isRecognized: true,
      };
    }
  }

  // Iterate rules in priority order
  for (const rule of rules) {
    try {
      if (rule.isRegex) {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(lower)) {
          return {
            normalized: rule.abbreviation,
            matchedRule: rule,
            isRecognized: true,
          };
        }
      } else {
        if (lower.includes(rule.pattern.toLowerCase())) {
          return {
            normalized: rule.abbreviation,
            matchedRule: rule,
            isRecognized: true,
          };
        }
      }
    } catch {
      // In case user entered invalid regex pattern, fallback to substring
      if (lower.includes(rule.pattern.toLowerCase())) {
        return {
          normalized: rule.abbreviation,
          matchedRule: rule,
          isRecognized: true,
        };
      }
    }
  }

  // If not matched, retain clean original string and flag as unrecognized
  return {
    normalized: clean,
    isRecognized: false,
  };
}
