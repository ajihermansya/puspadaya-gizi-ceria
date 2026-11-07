import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
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

interface BalitaResponse {
  total_stunting?: number;
  total_wasting?: number;
  total_underweight?: number;
  total_balita_sasaran?: number;
}

const COLORS = ["#ef4444", "#f59e0b", "#1e40af"];

const StatusGiziMlk: React.FC<DataSectionProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
}) => {
  const isMobile = useIsNarrow(640);

  const { data, isFirstLoad, isRefreshing, isError, isEmpty, error, refetch } =
    useDashboardQuery<BalitaResponse>("/balita", {
      region,
      desa,
      posyandu,
      month,
      year,
    });

  const chartData = [
    { name: "Stunting", value: data?.total_stunting ?? 0 },
    { name: "Wasting", value: data?.total_wasting ?? 0 },
    { name: "Underweight", value: data?.total_underweight ?? 0 },
  ];

  const totalBalitaSasaran = data?.total_balita_sasaran ?? 0;
  const hasNoTarget = totalBalitaSasaran === 0;
  const chartHeight = isMobile ? 250 : 300;

  const scopeLabel = `${region}${desa ? ` - ${desa}` : ""}${
    posyandu ? ` - ${posyandu}` : ""
  }`;

  return (
    <ChartCard
      title={`Status Gizi Balita ${scopeLabel}`}
      bodyHeight={chartHeight}
      skeleton="bar"
      isFirstLoad={isFirstLoad}
      isRefreshing={isRefreshing}
      isError={isError}
      error={error}
      onRetry={refetch}
      footer={
        <div
          className={`mt-4 rounded-lg p-3 text-center transition-all duration-300 sm:mt-6 sm:p-4 ${
            hasNoTarget
              ? "border border-amber-200 bg-amber-50"
              : "bg-gray-50"
          }`}
        >
          <p className="text-base font-semibold text-gray-800 sm:text-lg">
            Total Balita Sasaran:{" "}
            <span
              className={`${
                hasNoTarget ? "text-amber-600" : "text-blue-600"
              } text-sm sm:text-base`}
            >
              {totalBalitaSasaran}
            </span>
          </p>
          {isEmpty ? (
            <p className="mt-1 text-xs text-amber-600 sm:text-sm">
              Server belum punya data untuk periode & wilayah ini
            </p>
          ) : (
            hasNoTarget && (
              <p className="mt-1 text-xs text-amber-600 sm:text-sm">
                Belum ada data balita sasaran untuk periode ini
              </p>
            )
          )}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          margin={{
            top: isMobile ? 10 : 20,
            right: isMobile ? 10 : 30,
            left: isMobile ? 10 : 20,
            bottom: isMobile ? 10 : 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: isMobile ? 11 : 14 }}
            angle={isMobile ? -15 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : undefined}
          />
          <YAxis
            label={{
              value: "Persentase (%)",
              angle: -90,
              position: "insideLeft",
              fontSize: isMobile ? 11 : 14,
              offset: isMobile ? 0 : 10,
            }}
            tick={{ fontSize: isMobile ? 11 : 14 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Persentase"]}
            contentStyle={{ fontSize: isMobile ? 12 : 14 }}
          />

          <Bar dataKey="value" name="Persentase">
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={(value: number) => `${value}%`}
              fontSize={isMobile ? 10 : 12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default StatusGiziMlk;
