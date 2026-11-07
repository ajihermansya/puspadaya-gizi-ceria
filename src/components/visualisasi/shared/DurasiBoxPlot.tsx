import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import { useDashboardQuery, resolvePeriod } from "@/hooks/useDashboardQuery";
import { useIsNarrow } from "@/hooks/useIsNarrow";
import { getMonthName } from "@/lib/periode";

/**
 * Box plot durasi, dipakai bersama oleh chart Durasi Kunjungan Anak, Durasi
 * Kunjungan Ibu Hamil, dan Durasi Pelaksanaan Posyandu — di dua wilayah.
 * Sebelumnya enam file memegang salinan sendiri dari ~250 baris render yang
 * sama; perbedaan nyatanya cuma endpoint, judul, dan label kategori.
 */

export interface DurasiBoxPlotProps {
  region: string;
  desa?: string;
  posyandu?: string;
  month: number;
  year: number;
  /** Endpoint API, mis. "/api/waktu-kunjungan-anak". */
  endpoint: string;
  title: string;
  subtitle: string;
  /** Label kategori di legenda & tooltip, mis. "Durasi Kunjungan Anak". */
  category: string;
  color?: string;
  /** Tambahkan baris keterangan Q1/Q3 di blok penjelasan. */
  showQuartileLegend?: boolean;
}

interface DurasiResponse {
  rata_rata?: number | string;
  minimum?: number | string;
  maksimum?: number | string;
  median?: number | string;
  q1?: number | string;
  q3?: number | string;
}

const CHART_HEIGHT = 400;

/** API kadang mengirim "-" atau "" untuk nilai yang belum ada. */
const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "-" || value === "") {
    return 0;
  }
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const CustomBoxPlot = (props: any) => {
  const { payload, x, y, width, height } = props;
  if (!payload) return null;

  const centerX = x + width / 2;
  const boxWidth = width * 0.6;
  const whiskerWidth = width * 0.3;
  const chartBottom = y + height;

  const maxDataValue = Math.max(
    payload.max,
    payload.q3,
    payload.median,
    payload.q1,
    payload.min,
  );
  const domainMax = maxDataValue > 0 ? Math.ceil(maxDataValue * 1.2) : 5;
  const scale = height / domainMax;

  const clamp = (value: number) =>
    Math.max(y, Math.min(chartBottom - value * scale, chartBottom));

  const minY = clamp(payload.min);
  const q1Y = clamp(payload.q1);
  const medianY = clamp(payload.median);
  const q3Y = clamp(payload.q3);
  const maxY = clamp(payload.max);

  return (
    <g>
      {/* Kotak interkuartil Q1–Q3 */}
      <rect
        x={centerX - boxWidth / 2}
        y={q3Y}
        width={boxWidth}
        height={Math.max(0, q1Y - q3Y)}
        fill={payload.color}
        opacity={0.6}
        stroke="#374151"
        strokeWidth={1}
      />
      {/* Median */}
      <line
        x1={centerX - boxWidth / 2}
        y1={medianY}
        x2={centerX + boxWidth / 2}
        y2={medianY}
        stroke="#DC2626"
        strokeWidth={2}
      />
      {/* Whisker bawah */}
      <line
        x1={centerX}
        y1={minY}
        x2={centerX}
        y2={q1Y}
        stroke="#374151"
        strokeWidth={2}
      />
      <line
        x1={centerX - whiskerWidth / 2}
        y1={minY}
        x2={centerX + whiskerWidth / 2}
        y2={minY}
        stroke="#374151"
        strokeWidth={2}
      />
      {/* Whisker atas */}
      <line
        x1={centerX}
        y1={q3Y}
        x2={centerX}
        y2={maxY}
        stroke="#374151"
        strokeWidth={2}
      />
      <line
        x1={centerX - whiskerWidth / 2}
        y1={maxY}
        x2={centerX + whiskerWidth / 2}
        y2={maxY}
        stroke="#374151"
        strokeWidth={2}
      />
      {/* Label nilai */}
      <text
        x={centerX}
        y={minY - 5}
        fontSize={10}
        fill="#374151"
        textAnchor="middle"
        fontWeight="bold"
      >
        {payload.min.toFixed(2)}
      </text>
      <text
        x={centerX}
        y={q1Y + 15}
        fontSize={10}
        fill="#374151"
        textAnchor="middle"
      >
        {payload.q1.toFixed(2)}
      </text>
      <text
        x={centerX}
        y={medianY - 5}
        fontSize={10}
        fill="#DC2626"
        textAnchor="middle"
        fontWeight="bold"
      >
        {payload.median.toFixed(2)}
      </text>
      <text
        x={centerX}
        y={q3Y + 15}
        fontSize={10}
        fill="#374151"
        textAnchor="middle"
      >
        {payload.q3.toFixed(2)}
      </text>
      <text
        x={centerX}
        y={maxY - 5}
        fontSize={10}
        fill="#374151"
        textAnchor="middle"
        fontWeight="bold"
      >
        {payload.max.toFixed(2)}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const d = payload[0].payload;
  const rows = [
    { label: "Minimum", value: d.min },
    { label: "Kuartil 1 (Q1)", value: d.q1 },
    { label: "Median", value: d.median, highlight: true },
    { label: "Kuartil 3 (Q3)", value: d.q3 },
    { label: "Maksimum", value: d.max },
  ];

  return (
    <div className="max-w-xs rounded-lg border border-gray-300 bg-white p-4 text-sm shadow-lg">
      <p className="mb-2 border-b pb-2 font-semibold text-gray-800">
        {d.name} - {d.category}
      </p>
      <div className="space-y-1">
        {rows.map((row) => (
          <p key={row.label}>
            <span
              className={`font-medium ${row.highlight ? "text-red-600" : ""}`}
            >
              {row.label}:
            </span>{" "}
            {row.value.toFixed(2)} menit
          </p>
        ))}
      </div>
    </div>
  );
};

const DurasiBoxPlot: React.FC<DurasiBoxPlotProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
  endpoint,
  title,
  subtitle,
  category,
  color = "#3D9970",
  showQuartileLegend = false,
}) => {
  const isMobile = useIsNarrow(640);
  const period = resolvePeriod(month, year);

  const { data, isFirstLoad, isRefreshing, isError, isEmpty, error, refetch } =
    useDashboardQuery<DurasiResponse>(endpoint, {
      region,
      desa,
      posyandu,
      month,
      year,
    });

  const chartData = [
    {
      name: `${getMonthName(period.month)} ${period.year}`,
      category,
      color,
      min: toNumber(data?.minimum),
      q1: toNumber(data?.q1),
      median: toNumber(data?.median),
      q3: toNumber(data?.q3),
      max: toNumber(data?.maksimum),
    },
  ];

  return (
    <ChartCard
      className="mx-auto max-w-4xl shadow-lg"
      title={title}
      subtitle={subtitle}
      bodyHeight={CHART_HEIGHT}
      skeleton="bar"
      isFirstLoad={isFirstLoad}
      isRefreshing={isRefreshing}
      isError={isError}
      error={error}
      onRetry={refetch}
      footer={
        <>
          {isEmpty && (
            <p className="mt-3 text-center text-xs text-amber-600 sm:text-sm">
              Server belum punya data durasi untuk periode & wilayah ini
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <div
                className="h-5 w-5 rounded border-2"
                style={{
                  backgroundColor: color,
                  opacity: 0.7,
                  borderColor: color,
                }}
              />
              <span className="text-sm font-medium text-gray-700">
                {category}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <h4 className="mb-3 font-semibold text-blue-800">
              Keterangan Visualisasi Box Plot:
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-red-500" />
                <span>Garis merah = Nilai Median (titik tengah data)</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 border-2 border-gray-800 opacity-60"
                  style={{ backgroundColor: color }}
                />
                <span>
                  Kotak = Rentang Interkuartil (Q1 hingga Q3) - 50% data tengah
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 bg-gray-800" />
                <span>
                  Garis (whisker) = Rentang nilai minimum hingga maksimum
                </span>
              </div>
              {showQuartileLegend && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-xs">Q1</div>
                    <span> = Kuartil 1 </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-xs">Q3</div>
                    <span> = Kuartil 3 </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      }
    >
      <div className="rounded-xl bg-gray-50 p-4">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT - 32}>
          <ComposedChart
            data={chartData}
            margin={{
              top: 30,
              right: isMobile ? 20 : 40,
              left: isMobile ? 30 : 60,
              bottom: 80,
            }}
          >
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={false}
              height={50}
              label={{
                value: `Periode ${getMonthName(period.month)} ${period.year}`,
                position: "insideBottom",
                offset: -40,
                fontSize: 14,
              }}
            />
            <YAxis
              domain={[0, "dataMax + 1"]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#374151" }}
              tickFormatter={(value) =>
                value % 1 !== 0 ? Math.ceil(value * 100) / 100 : value
              }
              label={{
                value: "Durasi (menit)",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fontSize: "14px",
                  fill: "#374151",
                },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="max"
              fill="transparent"
              shape={<CustomBoxPlot />}
              maxBarSize={100}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default DurasiBoxPlot;
