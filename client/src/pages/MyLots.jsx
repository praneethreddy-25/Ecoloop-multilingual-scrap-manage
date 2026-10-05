import React, { useState } from 'react';
import useStore from '../store/useStore';
import LotCard from '../components/LotCard';
import { Filter, Search, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyLots() {
  const { lots } = useStore();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Deduplicate lots by ID
  const uniqueLots = Array.from(new Map(lots.map(item => [item.id, item])).values());

  const filtered = uniqueLots.filter(lot => {
    const matchesFilter = filter === 'all' || lot.status.toLowerCase() === filter.toLowerCase();
    const primaryMat = lot.materials?.[0]?.name || lot.materials?.[0]?.type || '';
    const matchesSearch = lot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          primaryMat.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">My Material Lots</h1>
          <p className="text-gray-500 text-sm">
            Digital passports for all your collected e-waste batches.
          </p>
        </div>

        <Link
          to="/collector/collect"
          className="btn-primary py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" /> New Collection
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Lot ID or Material type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-2xs">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-gray-700 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="collected">Collected (Pending Bid)</option>
            <option value="matched">Matched (Handover Scheduled)</option>
            <option value="recycled">Recycled (Completed)</option>
          </select>
        </div>
      </div>

      {/* Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(lot => (
          <LotCard key={lot.id} lot={lot} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <h3 className="font-bold text-gray-700">No lots found matching your filter</h3>
          <p className="text-xs text-gray-500">Try changing your search term or create a new collection batch.</p>
          <Link
            to="/collector/collect"
            className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Start New Collection
          </Link>
        </div>
      )}
    </div>
  );
}
