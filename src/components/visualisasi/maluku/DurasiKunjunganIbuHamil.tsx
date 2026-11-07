import React from "react";
import DurasiBoxPlot from "../shared/DurasiBoxPlot";

interface DataSectionProps {
  region: string;
  desa?: string;
  posyandu?: string;
  month: number;
  year: number;
}

const DurasiKunjunganIbuHamilMlk: React.FC<DataSectionProps> = (props) => (
  <DurasiBoxPlot
    {...props}
    endpoint="/api/waktu-kunjungan-ibu-hamil"
    title={`Durasi Kunjungan Ibu Hamil Oleh Kader di ${props.region}`}
    subtitle="Distribusi Waktu Kunjungan Ibu Hamil"
    category="Durasi Kunjungan Ibu Hamil"
    showQuartileLegend
  />
);

export default DurasiKunjunganIbuHamilMlk;
