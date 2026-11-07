import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

interface MpasiResponse {
  prevalensi_mpasi_iya?: number;
  prevalensi_mpasi_tidak?: number;
  prevalensi_mpasi_tidak_tahu?: number;
  prevalensi_mpasi_belum_diukur?: number;
  total_balita_mpasi?: number;
}

const COLORS = ["#1f77b4", "#ff7f0e", "#e63946"];

const MpasiBwi: React.FC<DataSectionProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
}) => {
  const isMobile = useIsNarrow(640);

  const { data, isFirstLoad, isRefreshing, isError, isEmpty, error, refetch } =
    useDashboardQuery<MpasiResponse>("/anak-mpasi", {
      region,
      desa,
      posyandu,
      month,
      year,
    });

  const chartData = [
    {
      name: "Ya",
      value: data?.prevalensi_mpasi_iya ?? 0,
      description: "Balita yang mendapat selain ASI",
    },
    {
      name: "Tidak",
      value: data?.prevalensi_mpasi_tidak ?? 0,
      description: "Balita yang tidak mendapat selain ASI",
    },
    {
      name: "Tidak Diisi",
      value: data?.prevalensi_mpasi_tidak_tahu ?? 0,
      description: "Status MPASI tidak diketahui",
    },
  ];

  const total = data?.total_balita_mpasi ?? 0;
  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);
  const chartHeight = isMobile ? 300 : 500;

  return (
    <ChartCard
      className="shadow-lg"
      title={`Persentase Balita Mendapatkan Makanan Selain ASI ${region}`}
      bodyHeight={chartHeight}
      skeleton="pie"
      isFirstLoad={isFirstLoad}
      isRefreshing={isRefreshing}
      isError={isError}
      error={error}
      onRetry={refetch}
      footer={
        <div className="mt-4 text-center">
          <div className="inline-block rounded-lg border border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-2 sm:px-4">
            <span className="text-sm font-medium text-gray-700 sm:text-base">
              Total Balita:{" "}
            </span>
            <span className="text-sm font-semibold text-gray-800 sm:text-base">
              {total}
            </span>
          </div>
          {isEmpty && (
            <p className="mt-2 text-xs text-amber-600 sm:text-sm">
              Server belum punya data MPASI untuk periode & wilayah ini
            </p>
          )}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 80 : 110}
            innerRadius={isMobile ? 35 : 50}
            labelLine
            label={({ name, value }) => {
              const percentValue = totalValue
                ? ((Number(value) / totalValue) * 100).toFixed(1)
                : "0";
              return `${name} ${percentValue}%`;
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value, name) => {
              const percent = totalValue
                ? ((Number(value) / totalValue) * 100).toFixed(1)
                : "0";
              const entry = chartData.find((d) => d.name === name);
              return [`${value} (${percent}%)`, entry?.description || name];
            }}
            contentStyle={{ fontSize: isMobile ? 12 : 14 }}
          />

          <Legend
            formatter={(value) => {
              const entry = chartData.find((d) => d.name === value);
              return entry ? `${value}: ${entry.description}` : value;
            }}
            wrapperStyle={{ fontSize: isMobile ? 11 : 13 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default MpasiBwi;
