export const KEY = "academic-metro-hub:v1";
export const PROFILE_KEY = "academic-metro-hub:profile";
export const THEME_KEY = "academic-metro-hub:theme";

export const EMPTY = {
  courses: [],
  sessions: [],
  exams: [],
  tasks: {},
  notes: {},
  resources: {},
  notifyEnabled: false
};

export const TYPES = ["lecture", "lab"];
export const EXAM_TYPES = ["written", "practical", "oral", "project"];
export const DURATIONS = [30, 60, 90, 120, 150, 180];

export const LOCALES = { ar: "ar-EG", en: "en-GB" };

// لوحة ألوان الخطوط — لون لكل مادة، عالية الإشباع على الأسطح الداكنة
export const PALETTE = ["#8B7BFF", "#3FE0B0", "#FF8A5C", "#FFC53D", "#5AB8FF", "#FF6FA5"];

// محور الزمن المعروض على الخط (٧ صباحًا → ١١ مساءً)
export const LINE_H0 = 7;
export const LINE_H1 = 23;
export const LINE_PXH = 68;
