import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Sparkles,
  MessageCircle,
  Search,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import logoAsset from "../assets/logo.jpeg";
import FeedbackSection from "../components/FeedbackSection";

const STORE_CONFIG = {
  crochet: {
    title: "Crochet Collection",
    subtitle:
      "Handcrafted yarn pieces, plushies & delicate keepsakes made with care.",
    otherLabel: "Explore Candles",
    otherPath: "/candles",
    Icon: Sparkles,
  },
  candles: {
    title: "Candles Collection",
    subtitle:
      "Small-batch sculpted & scented candles poured for warm, serene spaces.",
    otherLabel: "Explore Crochet",
    otherPath: "/crochet",
    Icon: Flame,
  },
};

export default function Storefront({ storeType = "candles" }) {
  const config = STORE_CONFIG[storeType] || STORE_CONFIG.candles;
  const { Icon } = config;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoSrc, setLogoSrc] = useState(logoAsset);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_type", storeType)
        .order("in_stock", { ascending: false })
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setErrorMsg(`Unable to load products: ${error.message}`);
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [storeType]);

  function buildWhatsAppUrl(item) {
    const rawPhone = import.meta.env.VITE_WHATSAPP_NUMBER || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedPrice = `₹${Number(item.price).toLocaleString("en-IN")}`;
    const collectionName = storeType === "crochet" ? "Crochet" : "Candles";

    const message = [
      `Hi Kirei Collection! I'd like to place an order:`,
      `• Item: ${item.name}`,
      `• Collection: ${collectionName}`,
      `• Price: ${formattedPrice}`,
      item.details ? `• Details: ${item.details}` : null,
      `Please let me know availability and payment details.`,
    ]
      .filter(Boolean)
      .join("\n");

    const encodedText = encodeURIComponent(message);
    return cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
  }

  const filteredProducts = products.filter((item) => {
    if (inStockOnly && !item.in_stock) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.details?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FDF6F5] text-[#2D2226] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#FDF6F5]/95 backdrop-blur-md border-b border-[#C8A262]/45">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-[#5A4A4F] hover:text-[#B8335A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logoSrc}
              alt="Kirei Collection"
              onError={() => setLogoSrc("/logo.jpeg")}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-[#C8A262]"
            />
            <span className="hidden sm:block text-sm font-bold tracking-[0.18em] uppercase text-[#2D2226]">
              Kirei Collection
            </span>
          </Link>

          <Link
            to={config.otherPath}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F7E4E2] hover:bg-[#B8335A] text-[#2D2226] hover:text-[#FDF6F5] border border-[#C8A262]/50 text-xs font-semibold transition-colors"
          >
            <span>{config.otherLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Collection Banner */}
      <section className="border-b border-[#C8A262]/35 bg-gradient-to-b from-[#F7E4E2]/75 to-[#FDF6F5]">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-[#FDF6F5] border border-[#C8A262]/60 flex items-center justify-center shadow-sm">
            <Icon className="w-6 h-6 text-[#B8335A]" />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#2D2226]">
            {config.title}
          </h1>

          <p className="mt-2.5 max-w-xl mx-auto text-sm md:text-base text-[#5A4A4F]">
            {config.subtitle}
          </p>

          {/* Search & Availability Filter */}
          <div className="mt-6 max-w-lg mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5A4A4F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${storeType}...`}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white/90 border border-[#C8A262]/55 text-sm text-[#2D2226] placeholder:text-[#5A4A4F]/65 focus:outline-none focus:border-[#B8335A]"
              />
            </div>

            <button
              type="button"
              onClick={() => setInStockOnly((prev) => !prev)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-colors ${
                inStockOnly
                  ? "bg-[#B8335A] text-[#FDF6F5] border-[#B8335A]"
                  : "bg-white/90 text-[#2D2226] border-[#C8A262]/55 hover:border-[#B8335A]"
              }`}
            >
              {inStockOnly ? "Showing In Stock" : "In Stock Only"}
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-white/70 border border-[#C8A262]/35 overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#F7E4E2]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#F7E4E2] rounded w-2/3" />
                  <div className="h-3 bg-[#F7E4E2] rounded w-1/2" />
                  <div className="h-9 bg-[#F7E4E2] rounded-full w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl bg-white border border-red-200 p-6 text-center text-sm text-red-700">
            {errorMsg}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl bg-white/80 border border-[#C8A262]/45 p-10 text-center space-y-3">
            <p className="text-base font-medium text-[#2D2226]">
              {products.length === 0
                ? "New handmade pieces are being added soon."
                : "No items match your current filter."}
            </p>
            {products.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setInStockOnly(false);
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-full bg-[#B8335A] text-[#FDF6F5] text-xs font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((item) => (
              <article
                key={item.id}
                className="group rounded-2xl bg-white border border-[#C8A262]/45 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-[#F7E4E2] overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        item.in_stock
                          ? "group-hover:scale-105"
                          : "grayscale opacity-75"
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#5A4A4F]">
                      Handcrafted by Kirei
                    </div>
                  )}

                  <span
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-sm ${
                      item.in_stock
                        ? "bg-[#FDF6F5]/95 text-[#2D2226] border border-[#C8A262]/70"
                        : "bg-[#2D2226]/90 text-[#FDF6F5]"
                    }`}
                  >
                    {item.in_stock ? "In Stock" : "Sold Out"}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-semibold text-[#2D2226] leading-snug">
                        {item.name}
                      </h2>
                      <span className="text-base font-bold text-[#B8335A] shrink-0">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {item.details && (
                      <p className="mt-1.5 text-xs text-[#5A4A4F] leading-relaxed">
                        {item.details}
                      </p>
                    )}
                  </div>

                  {item.in_stock ? (
                    <a
                      href={buildWhatsAppUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#B8335A] hover:bg-[#9E2448] text-[#FDF6F5] border border-[#C8A262]/50 text-xs uppercase tracking-wider font-semibold shadow-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Order on WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full px-4 py-2.5 rounded-full bg-[#F7E4E2] text-[#5A4A4F]/75 text-xs uppercase tracking-wider font-semibold cursor-not-allowed"
                    >
                      Currently Sold Out
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <FeedbackSection storeType={storeType} />

      {/* Footer */}
      <footer className="border-t border-[#C8A262]/35 py-6 text-center text-xs text-[#5A4A4F]">
        Kirei Collection · Handmade with love ·{" "}
        <Link to="/admin" className="text-[#B8335A] hover:underline">
          Seller Admin
        </Link>
      </footer>
    </div>
  );
}
