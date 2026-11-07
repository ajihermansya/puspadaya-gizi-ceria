
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { LoadingProvider } from "./context/LoadingContext";
import { queryClient } from "./services/api";
import { ErrorBoundary } from "./components/error/ErrorBoundary";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Team = lazy(() => import("./pages/Team"));
const NotFound = lazy(() => import("./pages/NotFound"));
const KebijakanPrivasi = lazy(() => import("./pages/KebijakanPrivasi"));
const SyaratdanKetentuan = lazy(() => import("./pages/SyaratdanKetentuan"));

// Loading component for lazy loaded routes
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="text-center">
      <div className="relative inline-block">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>
      <p className="mt-6 text-lg font-medium text-gray-700">Memuat halaman...</p>
      <div className="mt-2 text-sm text-gray-500">Pantau gizi & tumbuh kembang si kecil</div>
    </div>
  </div>
);

/**
 * Menahan layar "Memuat halaman..." selama 300ms pertama.
 *
 * Fallback ini mengambil seluruh layar (min-h-screen), jadi kalau chunk rute
 * sudah turun dalam 100ms — yang biasa terjadi setelah kunjungan pertama atau
 * di koneksi cepat — yang terlihat hanya kedipan layar penuh. Menunda
 * kemunculannya membuat navigasi cepat terasa langsung, dan layar pemuatan
 * tetap muncul kalau memang lambat.
 */
const DelayedPageLoader = ({ delayMs = 300 }: { delayMs?: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return visible ? <LoadingSpinner /> : null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* Satu Suspense untuk semua rute: tiap rute lazy, fallback-nya sama */}
            <Suspense fallback={<DelayedPageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/team" element={<Team />} />
                <Route path="/kebijakanprivasi" element={<KebijakanPrivasi />} />
                <Route path="/syaratdanketentuan" element={<SyaratdanKetentuan />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LoadingProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
