import React from "react";
import DurasiBoxPlot from "../shared/DurasiBoxPlot";

interface DataSectionProps {
  region: string;
  desa?: string;
  posyandu?: string;
  month: number;
  year: number;
}

const DurasiKunjunganAnakMlk: React.FC<DataSectionProps> = (props) => (
  <DurasiBoxPlot
    {...props}
    endpoint="/api/waktu-kunjungan-anak"
    title={`Durasi Kunjungan Anak Oleh Kader di ${props.region}`}
    subtitle="Distribusi Waktu Kunjungan Anak"
    category="Durasi Kunjungan Anak"
  />
);

export default DurasiKunjunganAnakMlk;
