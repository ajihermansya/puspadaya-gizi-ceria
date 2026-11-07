import React from "react";
import DurasiBoxPlot from "../shared/DurasiBoxPlot";

interface DataSectionProps {
  region: string;
  desa?: string;
  posyandu?: string;
  month: number;
  year: number;
}

const DurasiPelaksanaanPosyanduBwi: React.FC<DataSectionProps> = (props) => (
  <DurasiBoxPlot
    {...props}
    endpoint="/api/waktu-jadwal-posyandu"
    title={`Durasi Pelaksanaan Posyandu Oleh Kader di ${props.region}`}
    subtitle="Distribusi Waktu Pelaksanaan Posyandu"
    category="Durasi Posyandu"
  />
);

export default DurasiPelaksanaanPosyanduBwi;
