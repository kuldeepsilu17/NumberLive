'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Grid3X3,
  Calendar,
  Download,
  RefreshCw,
  Edit,
  CheckCircle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';

interface GameItem {
  id: string;
  name: string;
  slug: string;
  resultTime: string;
}

export default function OwnerChartsPage() {
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');
  const [games, setGames] = useState<GameItem[]>([]);
  const [selectedGameSlug, setSelectedGameSlug] = useState<string>('delhi');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9);

  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState<any>(null);

  // Quick Cell Edit Modal
  const [cellModalOpen, setCellModalOpen] = useState(false);
  const [cellData, setCellData] = useState<{
    gameSlug: string;
    gameName: string;
    date: string;
    currentValue: string;
  } | null>(null);
  const [newNumber, setNewNumber] = useState('');
  const [submittingCell, setSubmittingCell] = useState(false);
  const [cellSuccess, setCellSuccess] = useState<string | null>(null);

  // Load games
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/api/games');
        if (res.ok) {
          const data = await res.json();
          const gList = data.games || [];
          setGames(gList);
          if (gList.length > 0) {
            setSelectedGameSlug((prev) => prev || gList[0].slug);
          }
        }
      } catch (e) {
        console.error('Failed to load games:', e);
      }
    }
    loadGames();
  }, []);

  // Fetch Matrix
  const fetchMatrix = useCallback(async () => {
    setLoading(true);
    try {
      let url = '';
      if (viewType === 'monthly') {
        url = `/api/results?view=monthly_matrix&year=${selectedYear}&month=${selectedMonth}`;
      } else {
        url = `/api/results?view=yearly_matrix&game=${selectedGameSlug}&year=${selectedYear}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMatrixData(data);
      }
    } catch (e) {
      console.error('Failed to fetch chart matrix:', e);
    } finally {
      setLoading(false);
    }
  }, [viewType, selectedYear, selectedMonth, selectedGameSlug]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  const handleCellClick = (gameSlug: string, gameName: string, dateStr: string, currentVal: string) => {
    setCellData({
      gameSlug,
      gameName,
      date: dateStr,
      currentValue: currentVal === '--' ? '' : currentVal,
    });
    setNewNumber(currentVal === '--' ? '' : currentVal);
    setCellModalOpen(true);
  };

  const handleSaveCell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellData || !newNumber) return;

    setSubmittingCell(true);
    const cleanNum = newNumber.trim().padStart(2, '0');

    try {
      const gameObj = games.find((g) => g.slug === cellData.gameSlug);
      if (!gameObj) return;

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameObj.id,
          resultDate: cellData.date,
          resultValue: cleanNum,
          resultTime: gameObj.resultTime,
          status: 'PUBLISHED',
          reasonNote: `Updated directly from Owner Matrix Grid for ${cellData.date}`,
        }),
      });

      if (res.ok) {
        setCellSuccess(`Saved ${cleanNum} for ${cellData.gameName} on ${cellData.date}`);
        setTimeout(() => setCellSuccess(null), 3000);
        setCellModalOpen(false);
        await fetchMatrix();
      }
    } catch (err) {
      console.error('Cell update error:', err);
    } finally {
      setSubmittingCell(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
            DATA MATRIX
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Matrix Charts & Grid Inspector
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Click any cell in the chart matrix to instantly inspect or publish verified results.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMatrix}
            className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#C5A059] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C5A059]' : ''}`} />
            <span>Refresh Grid</span>
          </button>
        </div>
      </div>

      {cellSuccess && (
        <div className="p-3 rounded-[8px] bg-[#ECFDF5] dark:bg-[#062D20] border border-[#A7F3D0] dark:border-[#065F46] text-xs text-[#047857] dark:text-[#6EE7B7] flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{cellSuccess}</span>
        </div>
      )}

      {/* Mode & Filters Card */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-4 shadow-subtle space-y-4">
        {/* Toggle Mode */}
        <div className="flex items-center gap-2 border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-3">
          <button
            onClick={() => setViewType('monthly')}
            className={`min-h-[36px] px-4 py-1.5 rounded-[6px] text-xs font-bold transition-colors ${
              viewType === 'monthly'
                ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059]'
                : 'bg-[#FAF8F5] dark:bg-[#1C1C20] text-[#5C5449] dark:text-[#D4D4D8] border border-[#EAE3D5] dark:border-[#2E2E33]'
            }`}
          >
            Monthly Cross-Game Matrix
          </button>
          <button
            onClick={() => setViewType('yearly')}
            className={`min-h-[36px] px-4 py-1.5 rounded-[6px] text-xs font-bold transition-colors ${
              viewType === 'yearly'
                ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059]'
                : 'bg-[#FAF8F5] dark:bg-[#1C1C20] text-[#5C5449] dark:text-[#D4D4D8] border border-[#EAE3D5] dark:border-[#2E2E33]'
            }`}
          >
            12-Month Single Game Matrix
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Year */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#8C8275] block mb-1">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          {/* Month (for monthly view) */}
          {viewType === 'monthly' && (
            <div>
              <label className="text-[10px] font-bold uppercase text-[#8C8275] block mb-1">
                Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full min-h-[38px] px-2.5 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              >
                {Array.from({ length: 12 }).map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {new Date(2026, idx).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Game (for yearly view) */}
          {viewType === 'yearly' && (
            <div>
              <label className="text-[10px] font-bold uppercase text-[#8C8275] block mb-1">
                Select Game
              </label>
              <select
                value={selectedGameSlug}
                onChange={(e) => setSelectedGameSlug(e.target.value)}
                className="w-full min-h-[38px] px-2.5 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#71717A] animate-pulse space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
            <div>Generating chart matrix...</div>
          </div>
        ) : viewType === 'monthly' && matrixData?.matrix ? (
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] dark:bg-[#1C1C20] border-b border-[#EAE3D5] dark:border-[#2E2E33] text-[10px] font-black uppercase text-[#8C8275]">
                  <th className="py-2.5 px-3 text-left w-16">Day</th>
                  {matrixData.games?.map((g: any) => (
                    <th key={g.id} className="py-2.5 px-3 min-w-[75px] truncate">
                      {g.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                {Array.from({ length: matrixData.daysInMonth || 30 }).map((_, dIdx) => {
                  const day = dIdx + 1;
                  const dayPadded = String(day).padStart(2, '0');
                  const monthPadded = String(selectedMonth).padStart(2, '0');
                  const dateStr = `${selectedYear}-${monthPadded}-${dayPadded}`;

                  return (
                    <tr
                      key={day}
                      className="hover:bg-[#FAF8F5]/80 dark:hover:bg-[#1C1C20]/80 transition-colors"
                    >
                      <td className="py-2 px-3 text-left font-mono font-bold text-[#8C8275] bg-[#FAF8F5]/40 dark:bg-[#1C1C20]/40">
                        {dayPadded}
                      </td>
                      {matrixData.games?.map((g: any) => {
                        const val = matrixData.matrix[day]?.[g.slug] || '--';
                        const hasVal = val !== '--';

                        return (
                          <td
                            key={g.id}
                            onClick={() => handleCellClick(g.slug, g.name, dateStr, val)}
                            className="py-1.5 px-2 cursor-pointer transition-colors hover:bg-[#C5A059]/20"
                            title={`Click to edit ${g.name} (${dateStr})`}
                          >
                            <span
                              className={`inline-block w-8 py-0.5 rounded text-xs font-black tabular-nums ${
                                hasVal
                                  ? 'bg-[#ECFDF5] text-[#059669] dark:bg-[#064E3B]/40 dark:text-[#34D399]'
                                  : 'text-[#8C8275] opacity-50'
                              }`}
                            >
                              {val}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : viewType === 'yearly' && matrixData?.matrix ? (
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] dark:bg-[#1C1C20] border-b border-[#EAE3D5] dark:border-[#2E2E33] text-[10px] font-black uppercase text-[#8C8275]">
                  <th className="py-2.5 px-3 text-left w-16">Day</th>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
                    (m, idx) => (
                      <th key={m} className="py-2.5 px-2 min-w-[50px]">
                        {m}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                {Array.from({ length: 31 }).map((_, dIdx) => {
                  const day = dIdx + 1;
                  const dayPadded = String(day).padStart(2, '0');

                  return (
                    <tr
                      key={day}
                      className="hover:bg-[#FAF8F5]/80 dark:hover:bg-[#1C1C20]/80 transition-colors"
                    >
                      <td className="py-2 px-3 text-left font-mono font-bold text-[#8C8275] bg-[#FAF8F5]/40 dark:bg-[#1C1C20]/40">
                        {dayPadded}
                      </td>
                      {Array.from({ length: 12 }).map((_, mIdx) => {
                        const m = mIdx + 1;
                        const mPadded = String(m).padStart(2, '0');
                        const dateStr = `${selectedYear}-${mPadded}-${dayPadded}`;
                        const val = matrixData.matrix[day]?.[m] || '--';
                        const hasVal = val !== '--';

                        return (
                          <td
                            key={m}
                            onClick={() =>
                              handleCellClick(
                                matrixData.game.slug,
                                matrixData.game.name,
                                dateStr,
                                val
                              )
                            }
                            className="py-1.5 px-1 cursor-pointer transition-colors hover:bg-[#C5A059]/20"
                            title={`Click to edit ${matrixData.game?.name} (${dateStr})`}
                          >
                            <span
                              className={`inline-block w-7 py-0.5 rounded text-xs font-black tabular-nums ${
                                hasVal
                                  ? 'bg-[#ECFDF5] text-[#059669] dark:bg-[#064E3B]/40 dark:text-[#34D399]'
                                  : 'text-[#8C8275] opacity-40'
                              }`}
                            >
                              {val}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* Quick Cell Edit Modal */}
      {cellModalOpen && cellData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
              <div>
                <h3 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
                  Quick Result Edit
                </h3>
                <p className="text-xs text-[#71717A]">
                  {cellData.gameName} • {cellData.date}
                </p>
              </div>
              <button
                onClick={() => setCellModalOpen(false)}
                className="text-[#71717A] hover:text-[#111113] dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-[#8C8275]">
                  Outcome Number (00 - 99)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  required
                  autoFocus
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="00"
                  className="w-full min-h-[48px] text-center text-3xl font-black tabular-nums rounded-[8px] bg-[#FAF8F5] dark:bg-[#1F1F23] border-2 border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
                <button
                  type="button"
                  onClick={() => setCellModalOpen(false)}
                  className="px-3 py-2 rounded text-xs font-bold text-[#71717A] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCell || !newNumber}
                  className="px-4 py-2 rounded text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] disabled:opacity-50"
                >
                  {submittingCell ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
