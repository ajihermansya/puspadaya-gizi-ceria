import { useQuery, keepPreviousData } from "@tanstack/react-query";

export interface DashboardFilters {
  region: string;
  desa?: string;
  posyandu?: string;
  month: number;
  year: number;
}

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * DashboardTabs mengirim month/year = 0 kalau input periode dikosongkan.
 * Chart tidak boleh menembak API dengan bulan 0, jadi jatuhkan ke bulan ini.
 */
export const resolvePeriod = (month: number, year: number) => {
  const now = new Date();
  return {
    month: month > 0 ? month : now.getMonth() + 1,
    year: year > 0 ? year : now.getFullYear(),
  };
};

export interface DashboardQueryOptions {
  /**
   * "month" (default) — minta data satu bulan saja.
   * "year" — minta seluruh bulan dalam setahun (`bulan=0`). Chart deret waktu
   * memakai ini lalu memotong sendiri sampai bulan terpilih, jadi ganti bulan
   * tidak perlu menembak API lagi: satu response dipakai untuk 12 pilihan bulan.
   */
  periodScope?: "month" | "year";
}

const buildQueryString = (
  filters: DashboardFilters,
  periodScope: "month" | "year",
) => {
  const { month, year } = resolvePeriod(filters.month, filters.year);
  return new URLSearchParams({
    kabupaten_kota: filters.region,
    ...(filters.desa ? { desa: filters.desa } : {}),
    ...(filters.posyandu ? { posyandu: filters.posyandu } : {}),
    bulan: periodScope === "year" ? "0" : String(month),
    tahun: String(year),
  }).toString();
};

/**
 * Satu pintu untuk semua fetch chart dashboard.
 *
 * Yang ditangani di sini supaya tiap chart tidak mengulang:
 * - request dibatalkan lewat `signal` saat filter berganti, jadi response lama
 *   tidak bisa menimpa data baru
 * - response non-2xx dilempar sebagai error, bukan diam-diam jadi angka 0
 * - request identik dari beberapa chart didedupe oleh react-query
 * - `keepPreviousData`: data filter lama tetap tampil selagi data baru diambil,
 *   jadi kartu chart tidak perlu kolaps jadi spinner
 */
export function useDashboardQuery<T = unknown>(
  endpoint: string,
  filters: DashboardFilters,
  options: DashboardQueryOptions = {},
) {
  const { periodScope = "month" } = options;
  const { region, desa, posyandu, month, year } = filters;
  const period = resolvePeriod(month, year);

  const query = useQuery<T | null>({
    queryKey: [
      "dashboard",
      endpoint,
      region,
      desa ?? "",
      posyandu ?? "",
      // Scope "year" sengaja tidak memasukkan bulan: response-nya sama untuk
      // bulan apa pun, jadi ganti bulan dilayani dari cache.
      periodScope === "year" ? "all-months" : period.month,
      period.year,
    ],
    enabled: Boolean(region),
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const res = await fetch(
        `${endpoint}?${buildQueryString(filters, periodScope)}`,
        { signal },
      );

      if (!res.ok) {
        throw new ApiError(
          res.status >= 500
            ? "Server sedang bermasalah"
            : `Permintaan ditolak server (${res.status})`,
          res.status,
        );
      }

      const json = await res.json();
      return (json?.data ?? null) as T | null;
    },
  });

  // `keepPreviousData` membuat `data` berisi hasil filter SEBELUMNYA selama
  // filter baru masih diambil. Kalau pengambilan filter baru itu gagal, data
  // lama tetap ada di `query.data` — menampilkannya berarti memperlihatkan
  // angka wilayah/periode lain di bawah judul filter yang baru. Jadi error
  // tetap diangkat selama data yang dipegang masih milik filter lama.
  const holdingOtherFiltersData = query.isPlaceholderData;

  return {
    data: query.data ?? null,
    error: query.error,
    refetch: query.refetch,

    /** Belum ada data apa pun untuk digambar — ini saat skeleton tampil. */
    isFirstLoad: query.isPending,
    /** Sedang ambil data baru, tapi data lama masih tampil di layar. */
    isRefreshing: query.isFetching && !query.isPending,
    /** Gagal, dan tidak ada data sah milik filter ini untuk ditampilkan. */
    isError: query.isError && (query.data == null || holdingOtherFiltersData),
    /** Berhasil, tapi server memang tidak punya data untuk filter ini. */
    isEmpty:
      !query.isPending &&
      !query.isError &&
      !holdingOtherFiltersData &&
      query.data == null,
  };
}
