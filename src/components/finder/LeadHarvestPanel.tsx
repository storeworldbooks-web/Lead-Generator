'use client';

import React, { useState } from 'react';
import { CATEGORY_PRESETS } from '@/lib/osm/categories';
import { Search, MapPin, Sliders, Sparkles, Filter, Upload, Loader2, Globe, ShieldAlert } from 'lucide-react';
import { searchLocation, GeocodeResult } from '@/lib/osm/nominatim';
import { parseImportedFile } from '@/lib/export/sheets';
import { Lead } from '@/types';

interface LeadHarvestPanelProps {
  onSearch: (params: { city: string; lat: number; lon: number; radiusKm: number; category: string }) => Promise<void>;
  onImportLeads: (leads: Partial<Lead>[]) => void;
  isLoading: boolean;
  activeFilter: 'ALL' | 'HOT' | 'NO_WEBSITE';
  onFilterChange: (filter: 'ALL' | 'HOT' | 'NO_WEBSITE') => void;
  leadsCount: number;
}

export default function LeadHarvestPanel({
  onSearch,
  onImportLeads,
  isLoading,
  activeFilter,
  onFilterChange,
  leadsCount,
}: LeadHarvestPanelProps) {
  const [cityInput, setCityInput] = useState('Austin');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_PRESETS[0].id);
  const [radiusKm, setRadiusKm] = useState(5);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lon: number }>({
    lat: 30.2672,
    lon: -97.7431,
  });

  const popularCities = ['Austin', 'Miami', 'Chicago', 'London', 'Toronto'];

  const handleCityChange = async (val: string) => {
    setCityInput(val);
    if (val.trim().length > 2) {
      setIsGeocoding(true);
      try {
        const results = await searchLocation(val);
        setSuggestions(results);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsGeocoding(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (item: GeocodeResult) => {
    setCityInput(item.address?.city || item.displayName.split(',')[0]);
    setActiveCoords({ lat: item.lat, lon: item.lon });
    setSuggestions([]);
  };

  const handleQuickCityClick = async (city: string) => {
    setCityInput(city);
    setIsGeocoding(true);
    const results = await searchLocation(city);
    if (results.length > 0) {
      setActiveCoords({ lat: results[0].lat, lon: results[0].lon });
    }
    setIsGeocoding(false);
    setSuggestions([]);
  };

  const handleExecuteHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      city: cityInput,
      lat: activeCoords.lat,
      lon: activeCoords.lon,
      radiusKm,
      category: selectedCategory,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsed = await parseImportedFile(file);
        onImportLeads(parsed);
      } catch (err) {
        alert('Failed to parse file. Please verify it is a valid CSV or XLSX.');
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Local Lead Harvester</h2>
            <p className="text-xs text-slate-400">Query OpenStreetMap & Overpass API POIs</p>
          </div>
        </div>

        {/* Quick CSV Import */}
        <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer border border-slate-700 transition">
          <Upload className="w-3.5 h-3.5" />
          <span>Import CSV</span>
          <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Search Form */}
      <form onSubmit={handleExecuteHarvest} className="space-y-4">
        {/* City Input with Autocomplete */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            Target City / Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => handleCityChange(e.target.value)}
              placeholder="e.g. Austin, Miami, Chicago..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {isGeocoding && (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin absolute right-3 top-3" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl z-30 max-h-48 overflow-y-auto">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item.placeId}
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white border-b border-slate-900 last:border-none transition"
                >
                  <p className="font-medium truncate">{item.displayName}</p>
                </button>
              ))}
            </div>
          )}

          {/* Popular City Chips */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[11px] text-slate-500">Quick:</span>
            {popularCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickCityClick(city)}
                className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                  cityInput.toLowerCase() === city.toLowerCase()
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Business Category Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            Business Niche / Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {CATEGORY_PRESETS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label} (Avg Deal: ${cat.avgDealValue})
              </option>
            ))}
          </select>
        </div>

        {/* Search Radius Slider */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span>Search Radius</span>
            <span className="font-semibold text-indigo-400">{radiusKm} km ({Math.round(radiusKm * 0.621)} miles)</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Submit Harvest Button - GrowthMachine High-Conversion Style */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-[#ff6a13] to-[#ffaa00] hover:opacity-95 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Querying Overpass API...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Harvest Leads from OSM</span>
            </>
          )}
        </button>
      </form>

      {/* Filter Chips Bar */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">View:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onFilterChange('ALL')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
              activeFilter === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/40 text-slate-400 hover:text-white'
            }`}
          >
            All ({leadsCount})
          </button>
          <button
            onClick={() => onFilterChange('HOT')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              activeFilter === 'HOT'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800/40 text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Hot</span>
          </button>
          <button
            onClick={() => onFilterChange('NO_WEBSITE')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              activeFilter === 'NO_WEBSITE'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-800/40 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>No Website</span>
          </button>
        </div>
      </div>
    </div>
  );
}
