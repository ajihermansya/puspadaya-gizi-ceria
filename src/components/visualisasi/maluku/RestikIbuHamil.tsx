import React, { useRef } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { MoreVertical } from "lucide-react";
import * as htmlToImage from "html-to-image";
import ChartCard from "@/components/ui/ChartCard";
import { useDashboardQuery } from "@/hooks/useDashboardQuery";

interface DataSectionProps {
  region: string;
  desa?: string;
  posyandu?: string;
  month: number;
  year: number;
}

interface IbuHamilResponse {
  kek?: number;
  anemia?: {
    jumlah?: number;
    hbb_tidak_diketahui?: number;
  };
  pendek?: number;
  terlalu_tua?: number;
  terlalu_muda?: number;
  total_sasaran?: number;
}

const CHART_HEIGHT = 400;

const RestikIbuHamilMlk: React.FC<DataSectionProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
}) => {
  const barChartRef = useRef<HTMLDivElement>(null);

  const { data, isFirstLoad, isRefreshing, isError, isEmpty, error, refetch } =
    useDashboardQuery<IbuHamilResponse>("/ibu-hamil", {
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
    link.download = `RisikoIbuHamil.${format}`;
    link.click();
  };

  const displayData = [
    { name: "KEK", value: data?.kek ?? 0 },
    { name: "Anemia", value: data?.anemia?.jumlah ?? 0 },
    { name: "Pendek", value: data?.pendek ?? 0 },
    { name: "Terlalu Tua", value: data?.terlalu_tua ?? 0 },
    { name: "Terlalu Muda", value: data?.terlalu_muda ?? 0 },
    { name: "Hb Belum Diketahui", value: data?.anemia?.hbb_tidak_diketahui ?? 0 },
  ];

  const totalPengukuran = data?.total_sasaran ?? 0;

  return (
    <ChartCard
      className="mb-8"
      title={`Jumlah Ibu Hamil Berisiko - ${region}`}
      bodyHeight={CHART_HEIGHT}
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
        <div className="mt-6 rounded-lg bg-gray-100 p-4 text-center">
          <p className="font-medium text-gray-600">
            Total Sasaran:
            <span className="ml-2 font-semibold text-gray-800">
              {totalPengukuran.toLocaleString("id-ID")}
            </span>
          </p>
          {isEmpty && (
            <p className="mt-1 text-xs text-amber-600 sm:text-sm">
              Server belum punya data ibu hamil untuk periode & wilayah ini
            </p>
          )}
        </div>
      }
    >
      <div ref={barChartRef} className="rounded-lg bg-white">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart
            data={displayData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 130, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="name"
              type="category"
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8">
              <LabelList dataKey="value" position="right" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default RestikIbuHamilMlk;
