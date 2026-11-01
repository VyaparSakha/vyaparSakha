import { Lottie } from 'lottie-react';
import createStoreAnimation from '../../../assets/animations/storedashboard/01_Create_Store_Step_By_Step_2000ms.json';
import MobileStorePanel from './MobileStorePanel';

const DashboardHeader = ({ onCreateStore, filters, updateFilters, refreshStores, stats, isOwner }) => {
  return (
    <section className="pt-3 pb-2 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/70 border border-white/90 shadow-sm backdrop-blur-sm mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Command Center</span>
            </div>
            <h1 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              {stats[0]?.label || 'Store Dashboard'}
            </h1>
            <p className="mt-1 text-xs md:text-base text-slate-600 font-bold italic max-w-xl leading-snug">
              Manage and monitor your entire retail network from one central interface.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1 md:mt-0">
            {isOwner && (
              <button
                onClick={onCreateStore}
                aria-label="Create New Store"
                className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-xl"
              >
                <Lottie
                  src={createStoreAnimation}
                  loop
                  autoplay
                  style={{ width: 'full', height: 'full' }}
                />
              </button>
            )}

            <MobileStorePanel
              filters={filters}
              updateFilters={updateFilters}
              refreshStores={refreshStores}
              stats={stats}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
