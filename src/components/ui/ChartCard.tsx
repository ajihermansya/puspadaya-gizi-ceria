import React, { ReactNode } from "react";

type SkeletonShape = "bar" | "pie" | "line" | "stat";

interface ChartCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /**
   * Tinggi area chart dalam px. Dipatok supaya skeleton, pesan error, dan chart
   * asli menempati ruang yang sama — kartu tidak berubah tinggi saat data masuk,
   * jadi tidak ada konten yang melompat di bawahnya.
   */
  bodyHeight: number;
  skeleton?: SkeletonShape;
  isFirstLoad?: boolean;
  isRefreshing?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  /** Konten di bawah chart (total sasaran, legenda, catatan). */
  footer?: ReactNode;
  /** Tombol/menu di kanan judul, mis. menu download. Disembunyikan saat error. */
  headerAction?: ReactNode;
  className?: string;
  children: ReactNode;
}

const ChartSkeleton: React.FC<{ shape: SkeletonShape; height: number }> = ({
  shape,
  height,
}) => {
  const block = "bg-gray-200 rounded motion-safe:animate-pulse";

  if (shape === "pie") {
    const diameter = Math.min(height * 0.62, 190);
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5">
        <div
          className={`${block} rounded-full`}
          style={{ width: diameter, height: diameter }}
        />
        <div className="flex flex-wrap justify-center gap-3">
          {[64, 52, 72].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`${block} h-3 w-3 rounded-sm`} />
              <div className={`${block} h-3`} style={{ width: w }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (shape === "stat") {
    return (
      <div className="flex h-full flex-col justify-center gap-4">
        <div className={`${block} h-10 w-2/5`} />
        <div className={`${block} h-3 w-3/5`} />
        <div className={`${block} h-3 w-1/3`} />
      </div>
    );
  }

  if (shape === "line") {
    return (
      <div className="flex h-full gap-3">
        <div className="flex flex-col justify-between py-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`${block} h-2.5 w-7`} />
          ))}
        </div>
        <div className="relative flex-1 border-b border-l border-gray-200">
          {[0.25, 0.5, 0.75].map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-dashed border-gray-100"
              style={{ top: `${t * 100}%` }}
            />
          ))}
          <svg
            className="absolute inset-0 h-full w-full motion-safe:animate-pulse"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <polyline
              points="0,78 18,58 36,66 54,34 72,44 90,20 100,26"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    );
  }

  // bar
  const bars = [58, 82, 44, 70, 36, 64];
  return (
    <div className="flex h-full gap-3">
      <div className="flex flex-col justify-between py-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`${block} h-2.5 w-7`} />
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-end gap-2 border-b border-l border-gray-200 px-2 pb-0">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`${block} min-w-0 flex-1 rounded-b-none`}
              style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-2 pl-2">
          {bars.map((_, i) => (
            <div key={i} className={`${block} h-2.5 min-w-0 flex-1`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const ChartError: React.FC<{ error?: unknown; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "Gagal memuat data";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
        <svg
          className="h-5 w-5 text-red-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{message}</p>
        <p className="mt-1 text-xs text-gray-500">
          Angka tidak bisa ditampilkan, bukan berarti datanya nol.
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={() => onRetry()}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Coba lagi
        </button>
      )}
    </div>
  );
};

/**
 * Kartu chart dengan tinggi body tetap.
 *
 * Pengganti pola `if (loading) return <Spinner/>` yang meng-unmount seluruh
 * kartu: judul tetap di tempatnya, area chart tidak pernah berubah tinggi, dan
 * saat refetch data lama tetap terbaca sambil garis tipis berjalan di atas.
 */
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  bodyHeight,
  skeleton = "bar",
  isFirstLoad = false,
  isRefreshing = false,
  isError = false,
  error,
  onRetry,
  footer,
  headerAction,
  className = "",
  children,
}) => {
  const showSkeleton = isFirstLoad && !isError;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-4 shadow sm:p-6 ${className}`}
      aria-busy={isFirstLoad || isRefreshing}
    >
      {/* Indikator refetch: absolute, jadi tidak menggeser apa pun */}
      {isRefreshing && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-indigo-100">
          <div className="h-full w-1/3 bg-indigo-500 motion-safe:animate-chartcard-sweep" />
        </div>
      )}

      <div className="mb-4 flex items-start gap-2">
        {/* Penyeimbang kiri supaya judul tetap center meski ada menu di kanan */}
        {headerAction && <div className="w-9 shrink-0" aria-hidden="true" />}
        <div className="min-w-0 flex-1 text-center">
          <h3 className="text-lg font-semibold text-primary sm:text-xl">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">{subtitle}</p>
          )}
        </div>
        {/* Slot lebar tetap: menu hilang saat error/skeleton tanpa menggeser judul */}
        {headerAction && (
          <div className="w-9 shrink-0">
            {!isError && !showSkeleton && headerAction}
          </div>
        )}
      </div>

      <div style={{ minHeight: bodyHeight }} className="relative">
        {isError ? (
          <div
            role="status"
            className="absolute inset-0"
            style={{ minHeight: bodyHeight }}
          >
            <ChartError error={error} onRetry={onRetry} />
          </div>
        ) : showSkeleton ? (
          <div
            role="status"
            aria-label="Memuat data"
            className="absolute inset-0"
            style={{ minHeight: bodyHeight }}
          >
            <ChartSkeleton shape={skeleton} height={bodyHeight} />
          </div>
        ) : (
          children
        )}
      </div>

      {footer && !isError && !showSkeleton && footer}
    </div>
  );
};

export default ChartCard;
export { ChartSkeleton, ChartError };
