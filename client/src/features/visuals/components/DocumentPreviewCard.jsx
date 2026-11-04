'use client';

/**
 * DocumentPreviewCard.jsx
 * =======================
 * Interactive visual component for LLM-generated documents (Excel .xlsx / Word .docx).
 * 
 * Features:
 * 1. Executive card banner with document type icon (Excel green / Word blue), filename, size, and download.
 * 2. Inline container preview displaying structured sheet/document contents.
 * 3. "Full Page Viewing" interactive modal with:
 *    - Excel: Multi-sheet navigation tabs, instant row search/filtering, high-density table grid.
 *    - Word: Executive paper layout, headings, formatted paragraphs, and embedded data tables.
 *    - Direct download action from both inline card and full-page viewer.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Maximize2,
  X,
  Search,
  CheckCircle2,
  Table as TableIcon,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowDownToLine,
  Eye,
} from 'lucide-react';

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCell(val) {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'number') {
    return val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }
  return String(val);
}

export default function DocumentPreviewCard({ spec }) {
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const docType = (spec.documentType || 'excel').toLowerCase();
  const isExcel = docType === 'excel';
  const filename = spec.filename || (isExcel ? 'document.xlsx' : 'document.docx');
  const fileSize = spec.fileSize || 0;
  const downloadUrl = spec.downloadUrl;
  const preview = spec.preview || {};

  // Close full view on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isFullViewOpen) {
        setIsFullViewOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullViewOpen]);

  // Excel sheets data
  const sheets = useMemo(() => {
    if (preview.sheets && Array.isArray(preview.sheets) && preview.sheets.length > 0) {
      return preview.sheets;
    }
    // Fallback single sheet from top-level columns/rows
    if (preview.columns && Array.isArray(preview.columns)) {
      return [{
        name: preview.active_sheet || 'Sheet1',
        columns: preview.columns,
        rows: preview.rows || [],
        total_rows: (preview.rows || []).length,
      }];
    }
    return [{
      name: 'Sheet1',
      columns: ['Column 1', 'Column 2'],
      rows: [['Data Ready', 'Generated Document']],
      total_rows: 1,
    }];
  }, [preview]);

  const currentSheet = sheets[activeSheetIdx] || sheets[0];
  const columns = currentSheet?.columns || [];
  const allRows = currentSheet?.rows || [];

  // Filtered rows for full-view search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return allRows;
    const q = searchQuery.toLowerCase().trim();
    return allRows.filter(row =>
      Array.isArray(row) && row.some(cell => String(cell).toLowerCase().includes(q))
    );
  }, [allRows, searchQuery]);

  // Inline preview rows (first 8 rows)
  const inlineRows = useMemo(() => {
    return allRows.slice(0, 8);
  }, [allRows]);

  const handleDownload = () => {
    if (!downloadUrl) return;
    setIsDownloading(true);
    try {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  return (
    <div className="w-full my-3 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* ──────────────── Top Document Header ──────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isExcel
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {isExcel ? <FileSpreadsheet className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800 text-sm truncate max-w-xs sm:max-w-md">
                {filename}
              </h4>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                  isExcel
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {isExcel ? 'Excel .XLSX' : 'Word .DOCX'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{formatFileSize(fileSize)}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Download
              </span>
              {isExcel && sheets.length > 1 && (
                <>
                  <span>•</span>
                  <span>{sheets.length} Sheets</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsFullViewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-2xs cursor-pointer"
            title="Open interactive full page view"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Full View</span>
          </button>

          {downloadUrl && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-medium text-xs shadow-xs transition-all cursor-pointer ${
                isExcel
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
              }`}
              title="Download file to computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ──────────────── Inline Content Container ──────────────── */}
      <div className="p-4 bg-slate-50/50">
        {isExcel ? (
          /* Excel Inline Table Preview */
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
            {/* Sheet pill if multiple */}
            {sheets.length > 1 && (
              <div className="flex items-center gap-1 px-3 py-2 bg-slate-100/70 border-b border-slate-200 overflow-x-auto text-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Sheet:
                </span>
                {sheets.map((s, idx) => (
                  <button
                    key={s.name || idx}
                    type="button"
                    onClick={() => setActiveSheetIdx(idx)}
                    className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors ${
                      activeSheetIdx === idx
                        ? 'bg-white text-emerald-800 shadow-2xs border border-emerald-200 font-semibold'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {/* Scrollable Table View */}
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="px-3 py-2.5 w-10 text-center text-slate-400 font-mono text-[11px] border-b border-slate-800">
                      #
                    </th>
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-2.5 whitespace-nowrap text-slate-100 border-b border-slate-800 font-medium"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inlineRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-400">
                        No data rows available in this sheet.
                      </td>
                    </tr>
                  ) : (
                    inlineRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={rIdx % 2 === 1 ? 'bg-slate-50/70 hover:bg-slate-100/50' : 'bg-white hover:bg-slate-50/70'}
                      >
                        <td className="px-3 py-2 text-center text-[10px] font-mono text-slate-400 bg-slate-50/80 border-r border-slate-100">
                          {rIdx + 1}
                        </td>
                        {columns.map((_, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-3 py-2 whitespace-nowrap text-slate-700 font-normal"
                          >
                            {formatCell(row[cIdx])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary Notice */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
              <span>
                Showing {Math.min(inlineRows.length, 8)} of {allRows.length} rows • {columns.length} columns
              </span>
              <button
                type="button"
                onClick={() => setIsFullViewOpen(true)}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Page View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Word Inline Preview */
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="border-b border-slate-100 pb-3 mb-3">
              <h5 className="font-bold text-slate-800 text-sm">
                {preview.title || filename.replace('.docx', '').replace(/_/g, ' ')}
              </h5>
              {preview.subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{preview.subtitle}</p>
              )}
            </div>

            {/* Section preview snippets */}
            {preview.sections && preview.sections.length > 0 ? (
              <div className="space-y-3">
                {preview.sections.slice(0, 2).map((sec, sIdx) => (
                  <div key={sIdx} className="text-xs">
                    <div className="font-semibold text-slate-700 text-xs flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {sec.heading}
                    </div>
                    {sec.paragraphs && sec.paragraphs.length > 0 && (
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">
                        {sec.paragraphs[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Word document generated with formatted sections and analytical tables.
              </p>
            )}

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span>
                {preview.total_paragraphs || preview.sections?.length || 1} sections • {preview.total_tables || 0} tables
              </span>
              <button
                type="button"
                onClick={() => setIsFullViewOpen(true)}
                className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Read Full Document</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────── FULL PAGE VIEWING MODAL ──────────────── */}
      {isFullViewOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex flex-col p-2 sm:p-5 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full h-full max-w-6xl mx-auto overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isExcel ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isExcel ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                    {filename}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Full Document Viewer • {formatFileSize(fileSize)}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                {/* Search bar inside modal for Excel */}
                {isExcel && (
                  <div className="relative w-44 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search rows..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {downloadUrl && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-medium text-xs shadow-xs transition-colors cursor-pointer ${
                      isExcel
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsFullViewOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-slate-50/70 p-4 sm:p-6">
              {isExcel ? (
                /* Excel Full View */
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                  {/* Sheet Tabs Header */}
                  {sheets.length > 1 && (
                    <div className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> Sheets:
                      </span>
                      {sheets.map((s, idx) => (
                        <button
                          key={s.name || idx}
                          type="button"
                          onClick={() => {
                            setActiveSheetIdx(idx);
                            setSearchQuery('');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            activeSheetIdx === idx
                              ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                              : 'text-slate-600 hover:bg-white/80'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Full High-Density Table */}
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-900 text-white font-semibold shadow-xs">
                          <th className="px-3.5 py-3 w-12 text-center text-slate-400 font-mono text-xs border-b border-slate-800">
                            #
                          </th>
                          {columns.map((col, idx) => (
                            <th
                              key={idx}
                              className="px-4 py-3 whitespace-nowrap text-slate-100 font-semibold border-b border-slate-800"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRows.length === 0 ? (
                          <tr>
                            <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400">
                              {searchQuery ? `No rows matching "${searchQuery}".` : 'No data rows available.'}
                            </td>
                          </tr>
                        ) : (
                          filteredRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={
                                rIdx % 2 === 1
                                  ? 'bg-slate-50/70 hover:bg-emerald-50/40'
                                  : 'bg-white hover:bg-emerald-50/40'
                              }
                            >
                              <td className="px-3.5 py-2.5 text-center text-xs font-mono text-slate-400 bg-slate-50/80 border-r border-slate-100">
                                {rIdx + 1}
                              </td>
                              {columns.map((_, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="px-4 py-2.5 whitespace-nowrap text-slate-800"
                                >
                                  {formatCell(row[cIdx])}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer status bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 shrink-0">
                    <div className="flex items-center gap-3">
                      <span>Sheet: <strong className="text-slate-700">{currentSheet.name}</strong></span>
                      <span>•</span>
                      <span>
                        Showing {filteredRows.length} of {allRows.length} rows
                        {searchQuery && ' (filtered)'}
                      </span>
                    </div>
                    <span>{columns.length} columns</span>
                  </div>
                </div>
              ) : (
                /* Word Document Paper View */
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-14">
                  {/* Title Banner */}
                  <div className="border-b-2 border-blue-600 pb-5 mb-8">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {preview.title || filename.replace('.docx', '').replace(/_/g, ' ')}
                    </h2>
                    {preview.subtitle && (
                      <p className="text-sm font-medium text-slate-500 mt-2">
                        {preview.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                      <span>Generated by Vyapar Sakha AI</span>
                      <span>•</span>
                      <span>Confidential Business Report</span>
                    </div>
                  </div>

                  {/* Sections */}
                  {preview.sections && preview.sections.length > 0 ? (
                    <div className="space-y-8">
                      {preview.sections.map((sec, sIdx) => (
                        <div key={sIdx} className="space-y-3">
                          <h3
                            className={`font-bold text-slate-900 ${
                              sec.level === 1
                                ? 'text-lg sm:text-xl border-b border-slate-100 pb-2 text-slate-900'
                                : 'text-base text-slate-800'
                            }`}
                          >
                            {sec.heading}
                          </h3>

                          {sec.paragraphs && sec.paragraphs.map((p, pIdx) => (
                            <p key={pIdx} className="text-slate-700 text-sm leading-relaxed">
                              {p}
                            </p>
                          ))}

                          {/* Embedded Tables */}
                          {sec.tables && sec.tables.map((tbl, tIdx) => (
                            <div key={tIdx} className="overflow-x-auto rounded-xl border border-slate-200 my-4 shadow-2xs">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-900 text-white font-semibold">
                                    {tbl.headers && tbl.headers.map((h, hIdx) => (
                                      <th key={hIdx} className="px-4 py-2.5 whitespace-nowrap">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {tbl.rows && tbl.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-4 py-2.5 text-slate-700">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm">
                      Document content is prepared and ready in the downloaded Word file.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

