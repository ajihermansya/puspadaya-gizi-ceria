import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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

interface SkdnResponse {
  S?: number;
  K?: number;
  D?: number;
  N?: number;
}

const BAR_COLORS: Record<string, string> = {
  S: "#ef4444",
  K: "#f59e0b",
  D: "#10b981",
  N: "#3b82f6",
};

const LEGEND = [
  { key: "S", label: "Sasaran", bg: "bg-red-50", text: "text-red-800" },
  { key: "K", label: "KMS", bg: "bg-yellow-50", text: "text-yellow-800" },
  { key: "D", label: "Ditimbang", bg: "bg-green-50", text: "text-green-800" },
  { key: "N", label: "Naik BB", bg: "bg-blue-50", text: "text-blue-800" },
];

const GrafikSKDNMlk: React.FC<DataSectionProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
}) => {
  const isMobile = useIsNarrow(640);

  const { data, isFirstLoad, isRefreshing, isError, isEmpty, error, refetch } =
    useDashboardQuery<SkdnResponse>("/data-skdn", {
      region,
      desa,
      posyandu,
      month,
      year,
    });

  const chartData = [
    { name: "S", value: data?.S ?? 0, fullName: "Sasaran" },
    { name: "K", value: data?.K ?? 0, fullName: "KMS" },
    { name: "D", value: data?.D ?? 0, fullName: "Ditimbang" },
    { name: "N", value: data?.N ?? 0, fullName: "Naik BB" },
  ];

  const maxValue = Math.max(...chartData.map((item) => item.value));
  const yDomain = [0, Math.ceil(maxValue + maxValue * 0.1) || 1];
  const chartHeight = isMobile ? 250 : 300;

  const scopeLabel = `${region}${desa ? ` - ${desa}` : ""}${
    posyandu ? ` - ${posyandu}` : ""
  }`;

  return (
    <ChartCard
      title={`Grafik SKDN ${scopeLabel}`}
      bodyHeight={chartHeight}
      skeleton="bar"
      isFirstLoad={isFirstLoad}
      isRefreshing={isRefreshing}
      isError={isError}
      error={error}
      onRetry={refetch}
      footer={
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:mt-6 sm:gap-4 md:grid-cols-4">
            {LEGEND.map((item) => (
              <div
                key={item.key}
                className={`rounded-lg p-2 sm:p-3 ${item.bg}`}
              >
                <div className={`text-sm font-bold sm:text-base ${item.text}`}>
                  {item.key}
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          {isEmpty && (
            <p className="mt-3 text-center text-xs text-amber-600 sm:text-sm">
              Server belum punya data SKDN untuk periode & wilayah ini
            </p>
          )}
        </>
      }
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: isMobile ? 12 : 14 }} />
          <YAxis domain={yDomain} tick={{ fontSize: isMobile ? 12 : 14 }} />
          <Tooltip
            formatter={(value: number) => [`${value}`, "Jumlah Balita"]}
            labelFormatter={(name) => {
              const item = chartData.find((d) => d.name === name);
              return item ? `${name} (${item.fullName})` : name;
            }}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            shape={(props: any) => (
              <rect
                {...props}
                fill={BAR_COLORS[props.payload.name] || "#8884d8"}
              />
            )}
          >
            <LabelList
              dataKey="value"
              position="top"
              fontSize={isMobile ? 10 : 12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default GrafikSKDNMlk;
