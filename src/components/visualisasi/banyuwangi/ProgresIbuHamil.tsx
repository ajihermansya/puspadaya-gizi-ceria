import React, { useRef } from "react";
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

interface IbuHamilData {
  bulan: string;
  kek: number;
  pendek: number;
  terlaluTua: number;
  terlaluMuda: number;
}

type PeriodikResponse = Record<
  string,
  {
    kek?: number;
    pendek?: number;
    terlalu_tua?: number;
    terlalu_muda?: number;
  }
>;

const CHART_HEIGHT = 400;

const COLORS = {
  kek: "#1f77b4",
  pendek: "#2ca02c",
  terlaluTua: "#d62728",
  terlaluMuda: "#9467bd",
};

const LINE_STYLES = {
  kek: { strokeDasharray: "0" },
  pendek: { strokeDasharray: "10 5" },
  terlaluTua: { strokeDasharray: "3 3 9 3" },
  terlaluMuda: { strokeDasharray: "1 1" },
};

const buildZeroSeries = (monthLimit: number): IbuHamilData[] => {
  const limit = monthLimit > 0 ? Math.min(monthLimit, 12) : 12;
  return MONTH_LABELS_ID.slice(0, limit).map((bulan) => ({
    bulan,
    kek: 0,
    pendek: 0,
    terlaluTua: 0,
    terlaluMuda: 0,
  }));
};

const ProgresIbuHamilBwi: React.FC<DataSectionProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // periodScope "year": satu response dipakai untuk semua pilihan bulan,
  // pemotongan sampai bulan terpilih dilakukan di bawah tanpa fetch ulang.
  const { data, isFirstLoad, isRefreshing, isError, isEmpty, error, refetch } =
    useDashboardQuery<PeriodikResponse>(
      "/ibu-hamil-periodik",
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
    link.download = `ProgresIbuHamil.${format}`;
    link.click();
  };

  const ibuHamilData: IbuHamilData[] = React.useMemo(() => {
    if (!data) return buildZeroSeries(month);

    const mapped = Object.entries(data)
      .map(([bulan, values]) => ({
        bulan,
        kek: values?.kek ?? 0,
        pendek: values?.pendek ?? 0,
        terlaluTua: values?.terlalu_tua ?? 0,
        terlaluMuda: values?.terlalu_muda ?? 0,
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

  return (
    <ChartCard
      className="mb-8"
      title={`Progres Ibu Hamil Berisiko - ${region} (${year})`}
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
        isEmpty ? (
          <p className="mt-3 text-center text-xs text-amber-600 sm:text-sm">
            Server belum punya data ibu hamil periodik untuk tahun {year}
          </p>
        ) : null
      }
    >
      <div ref={chartRef} className="rounded-lg bg-white">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart
            data={ibuHamilData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="bulan"
              interval={0}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              label={{
                value: "Persentase (%)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  kek: "KEK",
                  pendek: "Pendek",
                  terlaluTua: "Terlalu Tua",
                  terlaluMuda: "Terlalu Muda",
                };
                return [`${value}%`, labels[name as string] || name];
              }}
              labelFormatter={(label) => `Bulan: ${label}`}
            />
            <Legend />

            <Line
              type="monotone"
              dataKey="kek"
              stroke={COLORS.kek}
              strokeWidth={2}
              {...LINE_STYLES.kek}
            >
              <LabelList dataKey="kek" position="top" />
            </Line>
            <Line
              type="monotone"
              dataKey="pendek"
              stroke={COLORS.pendek}
              strokeWidth={2}
              {...LINE_STYLES.pendek}
            >
              <LabelList dataKey="pendek" position="top" />
            </Line>
            <Line
              type="monotone"
              dataKey="terlaluTua"
              stroke={COLORS.terlaluTua}
              strokeWidth={2}
              {...LINE_STYLES.terlaluTua}
            >
              <LabelList dataKey="terlaluTua" position="top" />
            </Line>
            <Line
              type="monotone"
              dataKey="terlaluMuda"
              stroke={COLORS.terlaluMuda}
              strokeWidth={2}
              {...LINE_STYLES.terlaluMuda}
            >
              <LabelList dataKey="terlaluMuda" position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default ProgresIbuHamilBwi;
