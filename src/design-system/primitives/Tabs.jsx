import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 p-1 rounded-2xl bg-[#EAE5DC] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const id = tab.id ?? tab.value ?? tab;
        const label = tab.label ?? tab.name ?? tab;
        const Icon = tab.icon;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
              isActive
                ? 'bg-[#FFFEFA] dark:bg-[#2B2926] text-[#5B3E57] dark:text-[#D1A7CC] shadow-xs'
                : 'text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-[#F2ECF1] dark:bg-[#D1A7CC]/20 text-[#5B3E57] dark:text-[#D1A7CC]'
                    : 'bg-[#D8D0C5] dark:bg-white/[0.08] text-[#635E56] dark:text-[#A69F94]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;

