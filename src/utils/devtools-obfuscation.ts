// utils/devtools-obfuscation.ts

// Fungsi untuk mengaburkan (obfuscate) panggilan jaringan di devtools
// Catatan: Ini hanya mengubah tampilan permintaan untuk membuatnya kurang mencolok,
// bukan benar-benar menyembunyikan mereka (yang tidak mungkin dilakukan melalui JavaScript)

/**
 * Benar bahwa argumen non-string harus dilewati.
 *
 * Versi sebelumnya ditulis sebagai:
 *   typeof arg === 'string' && arg.includes('API') || arg.includes('fetch')
 * yang karena presedensi dibaca sebagai
 *   (typeof arg === 'string' && arg.includes('API')) || arg.includes('fetch')
 * sehingga untuk argumen non-string cabang kanan tetap dijalankan dan
 * `arg.includes` melempar TypeError. Karena console.error juga ditimpa,
 * `console.error('...', errorObject)` di main.tsx ikut melempar di produksi —
 * error di dalam penangan error.
 */
const mentionsApi = (args: unknown[]) =>
  args.some(
    (arg) =>
      typeof arg === 'string' &&
      (arg.includes('API') || arg.includes('fetch')),
  );

export const obfuscateNetworkCalls = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = (...args) => {
    if (!mentionsApi(args)) originalLog(...args);
  };

  console.warn = (...args) => {
    if (!mentionsApi(args)) originalWarn(...args);
  };

  // console.error sengaja TIDAK ditimpa: menyaringnya menyembunyikan kegagalan
  // nyata di produksi tanpa memberi manfaat keamanan apa pun — isi request
  // tetap terlihat di tab Network.
};

// Fungsi untuk menonaktifkan beberapa fitur debugging di production
export const disableDevtoolsDetection = () => {
  if (process.env.NODE_ENV !== 'production') return;

  Object.defineProperty(window, 'devtools', {
    get() {
      return undefined;
    },
  });

  // Dihapus: setInterval 1 detik dengan badan kosong. Timer itu tidak
  // menyembunyikan apa pun, hanya membangunkan tab tiap detik selamanya —
  // menahan browser dari penghematan daya di tab yang diam.
};