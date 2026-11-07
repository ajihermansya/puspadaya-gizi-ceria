import React from "react";
import StatusGiziBwi from "../banyuwangi/StatusGizi";
import GrafikSKDNBwi from "../banyuwangi/GrafikSKDN";
import ProgresGiziBwi from "../banyuwangi/ProgresGizi";
import AsiEKlusifBwi from "../banyuwangi/AsiEklusif";
import RestikIbuHamil from "../banyuwangi/RestikIbuHamil";
import ProgresIbuHamilBwi from "../banyuwangi/ProgresIbuHamil";
import KompetensiBebanKerja from "../banyuwangi/KompetensiBebanKerja";
import DurasiPelaksanaanPosyanduBwi from "../banyuwangi/DurasiPelaksanaanPosyandu";
import MpasiBwi from "../banyuwangi/Mpasi";
import DurasiKunjunganAnakBwi from "../banyuwangi/DurasiKunjunganAnak";
import DurasiKunjunganIbuHamilBwi from "../banyuwangi/DurasiKunjunganIbuHamil";

interface VisualisasiSectionBwiProps {
  region: string;
  desa: string;
  posyandu: string;
  month: number;
  year: number;
}

const VisualisasiSectionBwi: React.FC<VisualisasiSectionBwiProps> = ({
  region,
  desa,
  posyandu,
  month,
  year,
}) => {
  return (
    <section id="visualisasi" className="py-10">
      {/* Chart Atas */}
      <div className="px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart Gizi */}
          <StatusGiziBwi region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
          {/* Pie Chart User */}
          <GrafikSKDNBwi region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
        </div>
      </div>

      {/* Bar Chart Distribusi Balita */}
      <ProgresGiziBwi region={region} desa={desa} posyandu={posyandu} month={month} year={year} />

      <div className="px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MpasiBwi region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
          <AsiEKlusifBwi region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
        </div>
      </div>

      <RestikIbuHamil region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
      <ProgresIbuHamilBwi region={region} desa={desa} posyandu={posyandu} month={month} year={year} />

      <KompetensiBebanKerja region={region} desa={desa} posyandu={posyandu} month={month} year={year} />

      <div className="px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <DurasiKunjunganAnakBwi
            region={region}
            desa={desa}
            posyandu={posyandu}
            month={month}
            year={year}
          />
          <DurasiKunjunganIbuHamilBwi
            region={region}
            desa={desa}
            posyandu={posyandu}
            month={month}
            year={year}
          />
          <DurasiPelaksanaanPosyanduBwi
            region={region}
            desa={desa}
            posyandu={posyandu}
            month={month}
            year={year}
          />
        </div>
      </div>
    </section>
  );
};

export default VisualisasiSectionBwi;
