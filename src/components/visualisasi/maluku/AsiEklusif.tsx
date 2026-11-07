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

interface AsiResponse {
  prevalensi_asi_eksklusif_iya?: number;
  prevalensi_asi_eksklusif_tidak?: number;
  prevalensi_asi_eksklusif_tidak_tahu?: number;
  prevalensi_asi_eksklusif_belum_diukur?: number;
  total_balita_asi_eksklusif?: number;
}

const COLORS = ["#2b528a", "#d97706", "#e63946"];

const AsiEklusifMlk: React.FC<DataSectionProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
}) => {
  const isMobile = useIsNarrow(640);

  const { data, isFirstLoad, isRefreshing, isError, isEmpty, error, refetch } =
    useDashboardQuery<AsiResponse>("/asi-eksklusif", {
      region,
      desa,
      posyandu,
      month,
      year,
    });

  const chartData = [
    {
      name: "Ya",
      value: data?.prevalensi_asi_eksklusif_iya ?? 0,
      description: "Balita yang mendapat ASI Eksklusif",
    },
    {
      name: "Tidak",
      value: data?.prevalensi_asi_eksklusif_tidak ?? 0,
      description: "Balita yang tidak mendapat ASI Eksklusif",
    },
    {
      name: "Tidak Diisi",
      value: data?.prevalensi_asi_eksklusif_tidak_tahu ?? 0,
      description: "Status ASI Eksklusif tidak diketahui",
    },
  ];

  const total = data?.total_balita_asi_eksklusif ?? 0;
  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);
  const chartHeight = isMobile ? 300 : 500;

  return (
    <ChartCard
      className="shadow-lg"
      title={`Persentase Balita Mendapatkan ASI Eksklusif ${region}`}
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
              Server belum punya data ASI eksklusif untuk periode & wilayah ini
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
            outerRadius={isMobile ? 80 : 100}
            innerRadius={isMobile ? 35 : 45}
            label={({ name, value }) => {
              const percentValue = totalValue
                ? ((Number(value) / totalValue) * 100).toFixed(1)
                : "0";
              return `${name}: ${percentValue}%`;
            }}
            labelLine={{ stroke: "#666", strokeWidth: 1 }}
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

export default AsiEklusifMlk;
