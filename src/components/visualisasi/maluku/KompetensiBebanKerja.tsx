import React, { useRef } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { MoreVertical } from "lucide-react";
import * as htmlToImage from "html-to-image";
import ChartCard from "@/components/ui/ChartCard";
import { useDashboardQuery } from "@/hooks/useDashboardQuery";
import { useIsNarrow } from "@/hooks/useIsNarrow";

interface DataSectionProps {
  region: string;
  desa?: string;
  posyandu?: string;
  month: number;
  year: number;
}

interface WorkloadData {
  name: string;
  value: number;
}

type KompetensiResponse = Record<string, number> & {
  jumlah_kader_mengisi?: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  Balita: "Posyandu Balita",
  Ibu_Hamil_dan_Menyusui: "Posyandu Ibu Hamil",
  Kunjungan_Rumah: "Kunjungan Rumah",
  Tugas_Tambahan: "Tugas Tambahan",
};

const DEFAULT_WORKLOAD_DATA: WorkloadData[] = [
  { name: "Posyandu Balita", value: 0 },
  { name: "Posyandu Ibu Hamil", value: 0 },
  { name: "Kunjungan Rumah", value: 0 },
  { name: "Tugas Tambahan", value: 0 },
];

const KompetensiBebanKerjaMlk: React.FC<DataSectionProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
}) => {
  const barChartRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsNarrow(640);

  const { data, isFirstLoad, isRefreshing, isError, isEmpty, error, refetch } =
    useDashboardQuery<KompetensiResponse>("/jenis-kompetensi", {
      region,
      desa,
      posyandu,
      month,
      year,
    });

  const handleDownload = async (format: "png" | "jpeg") => {
    if (!barChartRef.current) return;

    const dataUrl =
      format === "png"
        ? await htmlToImage.toPng(barChartRef.current, {
            backgroundColor: "#ffffff",
          })
        : await htmlToImage.toJpeg(barChartRef.current, {
            quality: 0.95,
            backgroundColor: "#ffffff",
          });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `KompetensiBebanKerjaMlk.${format}`;
    link.click();
  };

  const workloadData: WorkloadData[] = data
    ? Object.entries(data)
        .filter(([key]) => key !== "jumlah_kader_mengisi")
        .map(([key, value]) => ({
          name: CATEGORY_LABELS[key] ?? key,
          value: (value as number) ?? 0,
        }))
    : DEFAULT_WORKLOAD_DATA;

  const jumlahKaderMengisi = data?.jumlah_kader_mengisi ?? 0;
  const chartHeight = isMobile ? 300 : 400;
  const regionLabel = region || "Maluku";

  return (
    <ChartCard
      className="mb-6 md:mb-8"
      title={`Jumlah Kader Berdasarkan Kompetensi Beban Kerja Kader - ${regionLabel}`}
      bodyHeight={chartHeight}
      skeleton="bar"
      isFirstLoad={isFirstLoad}
      isRefreshing={isRefreshing}
      isError={isError}
      error={error}
      onRetry={refetch}
      headerAction={
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="rounded-full p-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <MoreVertical className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Opsi unduh grafik</span>
          </MenuButton>
          <MenuItems className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg focus:outline-none">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleDownload("png")}
                  className={`${
                    active ? "bg-gray-100" : ""
                  } w-full px-4 py-2 text-left text-sm text-gray-700`}
                >
                  Download PNG
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleDownload("jpeg")}
                  className={`${
                    active ? "bg-gray-100" : ""
                  } w-full px-4 py-2 text-left text-sm text-gray-700`}
                >
                  Download JPG
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      }
      footer={
        <>
          <div className="mt-4 rounded-lg bg-gray-100 p-3 text-center sm:mt-6 sm:p-4">
            <p className="text-sm font-medium text-gray-600 sm:text-base">
              Jumlah Kader Mengisi
              <span className="ml-2 font-semibold text-gray-800">
                {jumlahKaderMengisi}
              </span>
            </p>
            {isEmpty && (
              <p className="mt-1 text-xs text-amber-600 sm:text-sm">
                Server belum punya data kompetensi untuk periode & wilayah ini
              </p>
            )}
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-3 sm:mt-6 sm:p-4">
            <h4 className="mb-2 text-sm font-semibold text-blue-800 sm:text-base">
              Keterangan Kategori:
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-xs text-gray-700 sm:text-sm">
              <li>
                Posyandu Balita: Kegiatan pelayanan kesehatan untuk balita di
                posyandu
              </li>
              <li>
                Posyandu Ibu Hamil: Kegiatan pelayanan kesehatan untuk ibu hamil
                di posyandu
              </li>
              <li>
                Kunjungan Rumah: Kunjungan langsung ke rumah untuk pendampingan
                kesehatan
              </li>
              <li>
                Tugas Tambahan: Tugas lainnya yang berkaitan dengan program gizi
              </li>
            </ul>
          </div>
        </>
      }
    >
      <div ref={barChartRef} className="rounded-lg bg-white">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            layout="vertical"
            data={workloadData}
            margin={{
              top: 20,
              right: isMobile ? 20 : 30,
              left: isMobile ? 80 : 150,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: isMobile ? 11 : 12 }} />
            <YAxis
              dataKey="name"
              type="category"
              width={isMobile ? 70 : 140}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value}`, "Jumlah Kader"]}
              labelFormatter={(name) => `Kategori: ${name}`}
              contentStyle={{ fontSize: isMobile ? 12 : 14 }}
            />
            <Legend />
            <Bar dataKey="value" fill="#2b528a" name="Jumlah Kader">
              <LabelList
                dataKey="value"
                position="right"
                fontSize={isMobile ? 10 : 12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default KompetensiBebanKerjaMlk;
