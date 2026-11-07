import React from "react";
import GrafikSKDNMlk from "../maluku/GrafikSKDN";
import ProgresGiziMlk from "../maluku/ProgresGizi";
import MpasiMlk from "../maluku/Mpasi";
import AsiEklusifMlk from "../maluku/AsiEklusif";
import RestikIbuHamilMlk from "../maluku/RestikIbuHamil";
import ProgresIbuHamilMlk from "../maluku/ProgresIbuHamil";
import KompetensiBebanKerjaMlk from "../maluku/KompetensiBebanKerja";
import StatusGiziMlk from "../maluku/StatusGizi";
import DurasiKunjunganAnakMlk from "../maluku/DurasiKunjunganAnak";
import DurasiKunjunganIbuHamilMlk from "../maluku/DurasiKunjunganIbuHamil";
import DurasiPelaksanaanPosyanduMlk from "../maluku/DurasiPelaksanaanPosyandu";

interface VisualisasiSectionMalukuProps {
  region: string;
  desa: string;
  posyandu: string;
  month: number;
  year: number;
}

const VisualisasiSectionMaluku: React.FC<VisualisasiSectionMalukuProps> = ({ region, desa, posyandu, month, year }) => {
  return (
    <section id="visualisasi" className="py-10">
      <div className="px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          <StatusGiziMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />

          <GrafikSKDNMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
        </div>
      </div>

      <ProgresGiziMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />

      <div className="px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MpasiMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
          <AsiEklusifMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
        </div>
      </div>

      <RestikIbuHamilMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
      <ProgresIbuHamilMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />

      <KompetensiBebanKerjaMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />

      <div className="px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <DurasiKunjunganAnakMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
          <DurasiKunjunganIbuHamilMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
          <DurasiPelaksanaanPosyanduMlk region={region} desa={desa} posyandu={posyandu} month={month} year={year} />
        </div>
      </div>


    </section>
  );
};

export default VisualisasiSectionMaluku;
