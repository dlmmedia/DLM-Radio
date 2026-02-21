"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { searchStations } from "@/lib/radio-browser";
import { GENRE_COLORS } from "@/lib/constants";
import type { Station } from "@/lib/types";
import { StationRow } from "./StationRow";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, SlidersHorizontal, Loader2, Radio, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GENRE_CHIPS = [
  "pop", "rock", "jazz", "electronic", "classical", "hip hop",
  "country", "latin", "reggae", "news", "ambient", "blues",
  "metal", "punk", "dance", "folk", "r&b", "world",
];

const QUALITY_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "128+", value: 128 },
  { label: "256+", value: 256 },
] as const;

export function SearchTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [countryFilter, setCountryFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [bitrateMin, setBitrateMin] = useState(0);

  const hasActiveFilters = selectedGenres.size > 0 || countryFilter || languageFilter || bitrateMin > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (
    q: string,
    genres: Set<string>,
    country: string,
    language: string,
    bitrate: number,
  ) => {
    if (!q.trim() && genres.size === 0 && !country && !language && bitrate === 0) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const stations = await searchStations({
        name: q || undefined,
        tag: genres.size === 1 ? [...genres][0] : undefined,
        tagList: genres.size > 1 ? [...genres].join(",") : undefined,
        country: country || undefined,
        language: language || undefined,
        bitrateMin: bitrate || undefined,
        limit: 100,
        order: "clickcount",
        reverse: true,
        hidebroken: true,
      });
      setResults(stations);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  const scheduleSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, selectedGenres, countryFilter, languageFilter, bitrateMin);
    }, 350);
  }, [query, selectedGenres, countryFilter, languageFilter, bitrateMin, doSearch]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(e.target.value, selectedGenres, countryFilter, languageFilter, bitrateMin);
    }, 350);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        doSearch(query, next, countryFilter, languageFilter, bitrateMin);
      }, 350);
      return next;
    });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCountryFilter(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, selectedGenres, val, languageFilter, bitrateMin);
    }, 350);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLanguageFilter(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, selectedGenres, countryFilter, val, bitrateMin);
    }, 350);
  };

  const handleBitrateChange = (val: number) => {
    setBitrateMin(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, selectedGenres, countryFilter, languageFilter, val);
    }, 350);
  };

  const clearFilters = () => {
    setSelectedGenres(new Set());
    setCountryFilter("");
    setLanguageFilter("");
    setBitrateMin(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, new Set(), "", "", 0);
    }, 100);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Input + Filter Toggle */}
      <div className="p-4 pb-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={handleQueryChange}
              placeholder="Search stations..."
              className="pl-9 h-9"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`relative flex items-center justify-center h-9 w-9 rounded-md border transition-colors flex-shrink-0 ${
              filtersOpen || hasActiveFilters
                ? "bg-primary/10 border-primary/40 text-primary"
                : "border-border hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && !filtersOpen && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-b border-border/30"
          >
            <div className="px-4 pb-3 space-y-3">
              {/* Genre Chips */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Genre
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRE_CHIPS.map((genre) => {
                    const active = selectedGenres.has(genre);
                    const color = GENRE_COLORS[genre] || "#6b7280";
                    return (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                          active
                            ? "border-transparent text-white"
                            : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                        style={active ? { backgroundColor: color } : undefined}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Country + Language */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                    Country
                  </label>
                  <Input
                    value={countryFilter}
                    onChange={handleCountryChange}
                    placeholder="e.g. Germany"
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                    Language
                  </label>
                  <Input
                    value={languageFilter}
                    onChange={handleLanguageChange}
                    placeholder="e.g. French"
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              {/* Quality + Clear */}
              <div className="flex items-end justify-between">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                    Quality
                  </label>
                  <div className="flex rounded-md border border-border/60 overflow-hidden">
                    {QUALITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleBitrateChange(opt.value)}
                        className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          bitrateMin === opt.value
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors pb-1"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="px-4 pb-4">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <Radio className="h-8 w-8 opacity-30 mb-2" />
              <p className="text-sm">No stations found</p>
              <p className="text-xs mt-1">Try different search terms or filters</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground mb-2">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-0.5">
                {results.map((station) => (
                  <StationRow
                    key={station.stationuuid}
                    station={station}
                    showCountry
                  />
                ))}
              </div>
            </>
          )}

          {!searched && !loading && (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 opacity-30 mb-2" />
              <p className="text-sm">Search for stations</p>
              <p className="text-xs mt-1">
                By name, country, language, or genre
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
