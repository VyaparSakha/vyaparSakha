"use client";

import { useManualProductAdd } from "../hooks";
import { Package, Search, X } from "lucide-react";

export const ManualProductModal = ({ inline = false }) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    isModalOpen,
    setIsModalOpen,
    filteredProducts,
    isSearching,
    addProduct,
    handleAddProduct,
  } = useManualProductAdd();

  const renderProductRows = (compact = false) => (
    <div className={compact ? "divide-y divide-slate-100" : "space-y-2.5 max-h-[50vh] overflow-y-auto p-1"}>
      {filteredProducts.map((product) => {
        const price = Number(product.price || product.sellingPrice || 0);
        const availableQty = Number(product.quantity || product.qty || 0);

        return (
          <div
            key={product._id}
            className={`flex items-center gap-3 ${
              compact
                ? "group px-3.5 py-2.5 transition-colors hover:bg-blue-50/60"
                : "p-3.5 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50">
              {product.image ? (
                <img
                  src={product.image}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <Package className="text-slate-400 group-hover:text-blue-600" size={20} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {product.name}
              </p>
              <p className="truncate text-[11px] text-slate-400 font-mono mt-0.5">
                {product.barcode
                  ? `Barcode: ${product.barcode}`
                  : product.sku
                  ? `SKU: ${product.sku}`
                  : "No barcode or SKU"}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    availableQty > 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-red-50 text-red-600 border border-red-200/60"
                  }`}
                >
                  Stock: {availableQty}
                </span>
                {product.category && (
                  <span className="text-[10px] font-medium text-slate-400 truncate">
                    {product.category}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-black text-slate-900">
                ₹{price.toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => addProduct(product)}
              disabled={availableQty <= 0}
              className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Add
            </button>
          </div>
        );
      })}
    </div>
  );

  if (inline) {
    return (
      <div className="h-full relative z-20 bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 p-5 md:p-6 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <Search size={17} />
              </div>
              <span>Quick Product Search</span>
            </h2>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
              Catalog Lookup
            </span>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Type name, barcode, or SKU to search..."
              className="w-full bg-slate-50/80 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              aria-label="Search products"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-2.5 font-medium">
          Instant search across entire inventory catalog
        </p>

        {searchTerm.trim() && (
          <div className="absolute left-3 right-3 top-full z-40 mt-2 max-h-80 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 p-1">
            <div className="px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <span>Search Results</span>
              <span>{filteredProducts.length} items</span>
            </div>
            {isSearching ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Searching catalog...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              renderProductRows(true)
            ) : (
              <p className="p-6 text-center text-xs text-slate-400 font-medium">
                No products found matching &quot;{searchTerm}&quot;
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Product Manually</h2>
              <p className="text-xs text-slate-500">Pick from store catalog or add a custom item</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsModalOpen(false);
              setSearchTerm("");
              setSelectedProduct(null);
              setQuantity(1);
            }}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-5 border-b border-slate-100">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product name, barcode or SKU..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-5">
          {isSearching ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Searching catalog...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            renderProductRows(false)
          ) : (
            <div className="py-12 text-center">
              <Package className="mx-auto text-slate-300 mb-2" size={36} />
              <p className="text-sm font-semibold text-slate-600">No matching products</p>
              <p className="text-xs text-slate-400 mt-1">Try another search keyword or barcode</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
