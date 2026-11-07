import { useEffect, useState } from "react";

/**
 * Menggantikan `useState` + listener `resize` yang disalin di tiap chart.
 *
 * Pakai `matchMedia` supaya browser hanya memberi kabar saat breakpoint
 * benar-benar terlewati, bukan tiap pixel pergerakan resize — dengan 11 chart
 * di satu halaman, 11 listener `resize` berarti 11 re-render per frame.
 */
export function useIsNarrow(maxWidth = 640) {
  const [isNarrow, setIsNarrow] = useState(
    () =>
      typeof window !== "undefined" && window.innerWidth < maxWidth,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsNarrow(e.matches);

    setIsNarrow(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [maxWidth]);

  return isNarrow;
}
