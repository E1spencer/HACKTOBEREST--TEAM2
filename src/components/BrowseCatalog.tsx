import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Star,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Code2,
  PenTool,
  Truck,
  Shirt,
  ShoppingBag,
  Cpu,
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api.ts';
import { ServiceCategory } from '../types/marketplace.ts';

interface BrowseCatalogProps {
  onBookAgent: (agent: any) => void;
}

export const BrowseCatalog: React.FC<BrowseCatalogProps> = ({ onBookAgent }) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedQuad, setSelectedQuad] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(4000);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState<string>('relevance');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [selectedCategory, searchQuery, selectedQuad, maxPrice, minRating, verifiedOnly, sortOption]);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.searchAgents({
        categorySlug: selectedCategory || undefined,
        q: searchQuery || undefined,
        campusZone: selectedQuad || undefined,
        maxPrice: maxPrice || undefined,
        minRating: minRating > 0 ? minRating : undefined,
        verifiedOnly,
        sort: sortOption,
      });
      setAgents(res.agents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-4 h-4" />;
      case 'PenTool':
        return <PenTool className="w-4 h-4" />;
      case 'Truck':
        return <Truck className="w-4 h-4" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
            selectedCategory === ''
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'glass-panel text-slate-300 hover:text-white hover:border-white/20'
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.slug === selectedCategory ? '' : c.slug)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl shrink-0 transition-all cursor-pointer ${
              selectedCategory === c.slug
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'glass-panel text-slate-300 hover:text-white hover:border-white/20'
            }`}
          >
            {getCategoryIcon(c.iconName)}
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, skills, or helper name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quad Location Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedQuad}
              onChange={(e) => setSelectedQuad(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="">All Campus Quads</option>
              <option value="North Quad">North Quad</option>
              <option value="Science Quad">Science Quad</option>
              <option value="Kendall Hall">Kendall Hall</option>
              <option value="West Quad">West Quad</option>
              <option value="East Towers">East Towers</option>
              <option value="Central Campus">Central Campus</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-2">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="relevance">Best Match</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="completion">Completion %</option>
            </select>
          </div>

          {/* Verified Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
              />
              <span>Verified Only</span>
            </label>
          </div>
        </div>

        {/* Max Hourly Rate Slider */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs">
          <span className="text-slate-400 text-[11px] font-medium shrink-0">Max Rate:</span>
          <input
            type="range"
            min="1000"
            max="4000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-48 accent-indigo-500 cursor-pointer"
          />
          <span className="font-bold text-cyan-400 text-xs">${(maxPrice / 100).toFixed(0)}/hr</span>
        </div>
      </div>

      {/* Helper Cards List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-white font-heading">
            Verified Oakwood Peer Helpers ({agents.length})
          </h2>
          <span className="text-xs text-slate-400">All prices in USD minor units · Escrow backed</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading verified helpers...</div>
        ) : agents.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-xs text-slate-400">
            <p className="text-sm font-semibold text-slate-200">No helpers matched your filters.</p>
            <p className="mt-1">Try widening your price range or clearing quad selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent, idx) => (
              <motion.div
                key={agent.agentId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <img
                      src={agent.photoUrl}
                      alt={agent.displayName}
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-indigo-500/30 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white truncate font-heading group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                          {agent.displayName}
                          {agent.badges?.includes('Top Rated') && (
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          )}
                        </h3>
                        <span className="text-sm font-extrabold text-cyan-400">
                          ${(agent.mainService.priceMinor / 100).toFixed(0)}/hr
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {agent.yearOfStudy} · {agent.major}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {agent.rating.toFixed(1)}
                        </span>
                        <span>·</span>
                        <span>{agent.reviewCount} reviews</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-medium">{agent.completionRate}% completion</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3.5 leading-relaxed">
                    {agent.bio}
                  </p>

                  {/* Service box */}
                  <div className="bg-slate-900/80 rounded-xl p-3 border border-white/5 mb-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                      Featured Campus Service
                    </span>
                    <p className="text-xs font-semibold text-white line-clamp-1">
                      {agent.mainService.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{agent.baseCampusZone}</span>
                    </div>
                  </div>

                  {/* What's Included */}
                  {agent.mainService.whatsIncluded?.length > 0 && (
                    <div className="mb-4 space-y-1">
                      {agent.mainService.whatsIncluded.slice(0, 2).map((inc: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{inc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Booking Trigger */}
                <button
                  onClick={() =>
                    onBookAgent({
                      agentId: agent.agentId,
                      displayName: agent.displayName,
                      photoUrl: agent.photoUrl,
                      major: agent.major,
                      serviceTitle: agent.mainService.title,
                      serviceId: agent.mainService.id,
                      pricePerHourMinor: agent.mainService.priceMinor,
                      baseCampusZone: agent.baseCampusZone,
                    })
                  }
                  className="w-full py-2.5 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Book Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
