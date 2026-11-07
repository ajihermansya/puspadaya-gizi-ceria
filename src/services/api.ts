import { QueryClient } from "@tanstack/react-query";

// Cache untuk menyimpan hasil API yang baru saja diambil
const apiCache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit dalam milidetik

/**
 * Fungsi untuk mengambil data dari API dengan caching
 */
export const fetchDataWithCache = async (endpoint: string, params: Record<string, any> = {}) => {
  // Buat cache key berdasarkan endpoint dan parameter
  const queryParams = new URLSearchParams(params).toString();
  const cacheKey = `${endpoint}?${queryParams}`;

  const now = Date.now();
  
  // Cek apakah data sudah ada di cache dan belum kadaluarsa
  const cached = apiCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  // Cek apakah sudah ada request yang sedang berlangsung untuk endpoint yang sama
  if (cached && cached.promise) {
    return cached.promise;
  }

  // Bangun URL dengan parameter
  const url = new URL(endpoint, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  // Buat promise untuk request
  const requestPromise = fetch(url.toString())
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Simpan data ke cache
      apiCache.set(cacheKey, { data, timestamp: Date.now() });
      // Hapus promise dari cache setelah selesai
      if (apiCache.has(cacheKey)) {
        const existing = apiCache.get(cacheKey);
        if (existing) {
          apiCache.set(cacheKey, { data: existing.data, timestamp: existing.timestamp }); // hapus promise
        }
      }
      return data;
    })
    .catch(error => {
      // Hapus cache jika terjadi error
      apiCache.delete(cacheKey);
      throw error;
    });

  // Simpan promise ke cache agar request duplikat dapat menunggu
  if (cached) {
    apiCache.set(cacheKey, { ...cached, promise: requestPromise });
  } else {
    apiCache.set(cacheKey, { data: null, timestamp: now, promise: requestPromise });
  }

  return requestPromise;
};

// Query client dengan konfigurasi caching yang dioptimalkan
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // gcTime: nama v5 untuk cacheTime (v4). Pakai nama lama = opsi diabaikan.
      gcTime: 1000 * 60 * 10,      // Simpan di memory 10 menit setelah tak dipakai
      staleTime: 1000 * 60 * 5,    // Data dianggap segar selama 5 menit
      retry: 2,                    // Coba ulang 2x sebelum menyerah
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000), // backoff: 1s, 2s
      refetchOnWindowFocus: false, // Jangan refetch saat fokus window
      refetchOnMount: false,       // Jangan refetch saat mount jika data masih fresh
    },
  },
});

// Fungsi untuk membersihkan cache lama secara berkala
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of apiCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      apiCache.delete(key);
    }
  }
}, 60 * 1000); // Bersihkan cache setiap 1 menit