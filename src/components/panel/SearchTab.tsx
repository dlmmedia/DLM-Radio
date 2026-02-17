"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRadioStore } from "@/stores/radioStore";
import { searchStations } from "@/lib/radio-browser";
import type { Station } from "@/lib/types";
import { StationRow } from "./StationRow";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, Radio } from "lucide-react";

export function SearchTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const stations = await searchStations({
        name: q,
        limit: 50,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            placeholder="Search stations..."
            className="pl-9 h-9"
          />
        </div>
      </div>

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
              <p className="text-xs mt-1">Try a different search term</p>
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
