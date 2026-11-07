export const MONTH_LABELS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const MONTHS_ID = MONTH_LABELS_ID.map((m) => m.toLowerCase());

const MONTHS_EN = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** Nama bulan (ID atau EN) -> 1..12, atau 0 kalau tidak dikenali. */
export const getMonthNumber = (monthName: string): number => {
  const lower = monthName.trim().toLowerCase();
  const idIndex = MONTHS_ID.indexOf(lower);
  if (idIndex !== -1) return idIndex + 1;

  const enIndex = MONTHS_EN.indexOf(lower);
  return enIndex === -1 ? 0 : enIndex + 1;
};

/** 1..12 -> "Januari".. ; di luar rentang dikembalikan apa adanya. */
export const getMonthName = (month: number): string =>
  MONTH_LABELS_ID[month - 1] ?? String(month);
