import React, { useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
import { MONTH_LABELS_ID, getMonthNumber } from "@/lib/periode";

interface DataSectionProps {
  region: string;
  desa?: string;
  posyandu?: string;
  month: number;
  year: number;
}

interface GiziData {
  bulan: string;
  stunting: number;
  wasting: number;
  underweight: number;
  normal: number;
}

type ProgresResponse = Record<
  string,
  {
    total_stunting?: number;
    total_wasting?: number;
    total_underweight?: number;
    total_normal?: number;
  }
>;

const CHART_HEIGHT = 400;

const SERIES = [
  { key: "stunting", name: "Stunting", color: "#ef4444" },
  { key: "wasting", name: "Wasting", color: "#3b82f6" },
  { key: "underweight", name: "Underweight", color: "#8B4513" },
  { key: "normal", name: "Normal", color: "#16a34a" },
] as const;

const buildZeroSeries = (monthLimit: number): GiziData[] => {
  const limit = monthLimit > 0 ? Math.min(monthLimit, 12) : 12;
  return MONTH_LABELS_ID.slice(0, limit).map((bulan) => ({
    bulan,
    stunting: 0,
    wasting: 0,
    underweight: 0,
    normal: 0,
  }));
};

const ProgresGiziMlk: React.FC<DataSectionProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // periodScope "year": deret setahun diambil sekali, ganti bulan hanya
  // memotong deret yang sudah ada — tidak menembak API lagi.
  const { data, isFirstLoad, isRefreshing, isError, isEmpty, error, refetch } =
    useDashboardQuery<ProgresResponse>(
      "/progres-status-gizi",
      { region, desa, posyandu, month, year },
      { periodScope: "year" },
    );

  const handleDownload = async (format: "png" | "jpeg") => {
    if (!chartRef.current) return;
    const dataUrl =
      format === "png"
        ? await htmlToImage.toPng(chartRef.current, {
            backgroundColor: "#ffffff",
          })
        : await htmlToImage.toJpeg(chartRef.current, {
            quality: 0.95,
            backgroundColor: "#ffffff",
          });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `ProgresGizi.${format}`;
    link.click();
  };

  const giziData: GiziData[] = useMemo(() => {
    if (!data) return buildZeroSeries(month);

    const mapped = Object.entries(data)
      .map(([bulan, values]) => ({
        bulan,
        stunting: values?.total_stunting ?? 0,
        wasting: values?.total_wasting ?? 0,
        underweight: values?.total_underweight ?? 0,
        normal: values?.total_normal ?? 0,
      }))
      .sort((a, b) => getMonthNumber(a.bulan) - getMonthNumber(b.bulan));

    if (month > 0) {
      return mapped.filter((item) => {
        const n = getMonthNumber(item.bulan);
        return n > 0 && n <= month;
      });
    }
    return mapped;
  }, [data, month]);

  const allZero = useMemo(
    () =>
      giziData.length === 0 ||
      !giziData.some(
        (d) => d.stunting > 0 || d.wasting > 0 || d.underweight > 0 || d.normal > 0,
      ),
    [giziData],
  );

  return (
    <ChartCard
      className="mb-8"
      title={`Progres Status Gizi - ${region} (${year})`}
      bodyHeight={CHART_HEIGHT}
      skeleton="line"
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
        isEmpty || allZero ? (
          <p className="mt-3 text-center text-xs text-amber-600 sm:text-sm">
            {isEmpty
              ? `Server belum punya data progres gizi untuk tahun ${year}`
              : "Semua nilai masih 0 untuk periode ini"}
          </p>
        ) : null
      }
    >
      <div ref={chartRef} className="rounded-lg bg-white">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart
            data={giziData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="bulan"
              interval={0}
              padding={{ left: 20, right: 20 }}
              angle={-15}
              textAnchor="end"
            />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />

            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                name={s.name}
              >
                <LabelList
                  dataKey={s.key}
                  position="top"
                  formatter={(value: number) => `${value}%`}
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default ProgresGiziMlk;
