import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Sparkles, ArrowUpRight } from "lucide-react";
import BrandHeader from "../components/BrandHeader";
import crochetBg from "../assets/crochet-bg.jpeg";
import candleBg from "../assets/candle-bg.jpeg";

export default function Home() {
  const navigate = useNavigate();
  const [openingSide, setOpeningSide] = useState(null); // 'crochet' | 'candles' | null

  const handleOpenCollection = (side, route) => {
    if (openingSide) return;
    setOpeningSide(side);

    setTimeout(() => {
      navigate(route);
    }, 650);
  };

  const isCrochetOpening = openingSide === "crochet";
  const isCandlesOpening = openingSide === "candles";
  const isTransitioning = openingSide !== null;

  return (
    <div className="relative flex flex-col md:flex-row w-full h-screen overflow-hidden bg-[#FDF6F5] select-none">
      <BrandHeader hidden={isTransitioning} showAdminLink={true} />

      {/* ================= SIDE 1: CROCHET ================= */}
      <section
        onClick={() => handleOpenCollection("crochet", "/crochet")}
        className={`group relative cursor-pointer overflow-hidden flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isCrochetOpening
            ? "flex-[10] z-20"
            : isCandlesOpening
              ? "flex-[0.0001] opacity-0 pointer-events-none"
              : "flex-1 hover:md:flex-[1.25] border-b md:border-b-0 md:border-r border-[#C8A262]/55"
        }`}
      >
        <div
          className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out ${
            isCrochetOpening
              ? "scale-110 saturate-110"
              : "saturate-95 group-hover:saturate-110 group-hover:scale-105"
          }`}
          style={{ backgroundImage: `url(${crochetBg})` }}
        />
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isCrochetOpening
              ? "bg-[#2D2226]/40"
              : "bg-[#2D2226]/60 group-hover:bg-[#2D2226]/45"
          }`}
        />

        <div
          className={`relative z-10 text-center px-6 pt-56 md:pt-72 max-w-md text-[#FDF6F5] transition-all duration-500 ${
            isTransitioning && !isCrochetOpening
              ? "opacity-0 scale-95"
              : "opacity-100 group-hover:-translate-y-1"
          }`}
        >
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#FDF6F5]/15 backdrop-blur-md border border-[#C8A262]/60 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Sparkles className="w-7 h-7 text-[#F4C2C2]" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">
            Crochet
          </h1>

          <p className="text-sm md:text-base text-[#F7E4E2] mb-6">
            Handcrafted yarn pieces &amp; delicate keepsakes made with care.
          </p>

          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B8335A] group-hover:bg-[#9E2448] text-[#FDF6F5] border border-[#C8A262]/60 text-xs uppercase tracking-widest font-semibold shadow-md transition-all duration-300">
            Explore Crochet
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </section>

      {/* ================= SIDE 2: CANDLES ================= */}
      <section
        onClick={() => handleOpenCollection("candles", "/candles")}
        className={`group relative cursor-pointer overflow-hidden flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isCandlesOpening
            ? "flex-[10] z-20"
            : isCrochetOpening
              ? "flex-[0.0001] opacity-0 pointer-events-none"
              : "flex-1 hover:md:flex-[1.25]"
        }`}
      >
        <div
          className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out ${
            isCandlesOpening
              ? "scale-110 saturate-110"
              : "saturate-95 group-hover:saturate-110 group-hover:scale-105"
          }`}
          style={{ backgroundImage: `url(${candleBg})` }}
        />

        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isCandlesOpening
              ? "bg-[#2D2226]/40"
              : "bg-[#2D2226]/60 group-hover:bg-[#2D2226]/45"
          }`}
        />

        <div
          className={`relative z-10 text-center px-6 pt-56 md:pt-72 max-w-md text-[#FDF6F5] transition-all duration-500 ${
            isTransitioning && !isCandlesOpening
              ? "opacity-0 scale-95"
              : "opacity-100 group-hover:-translate-y-1"
          }`}
        >
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#FDF6F5]/15 backdrop-blur-md border border-[#C8A262]/60 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
            <Flame className="w-7 h-7 text-[#E5B869]" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">
            Candles
          </h1>

          <p className="text-sm md:text-base text-[#F7E4E2] mb-6">
            Sculpted &amp; scented candles poured for warm, serene spaces.
          </p>

          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B8335A] group-hover:bg-[#9E2448] text-[#FDF6F5] border border-[#C8A262]/60 text-xs uppercase tracking-widest font-semibold shadow-md transition-all duration-300">
            Explore Candles
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </section>
    </div>
  );
}