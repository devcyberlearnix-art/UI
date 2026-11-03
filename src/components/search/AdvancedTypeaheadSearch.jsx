import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function AdvancedTypeaheadSearch({ onExecuteSearch, placeholder, initialValue = '', className = '' }) {
  const [inputVal, setInputVal] = useState(initialValue);
  const [predictions, setPredictions] = useState([]);
  const [dropdownActive, setDropdownActive] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerWrapper = useRef(null);

  // Sync initialValue when it changes from external triggers (e.g. URL query params)
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== inputVal) {
      setInputVal(initialValue);
    }
  }, [initialValue]);

  // Close floating matrix dropdown cleanly on global window interaction clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerWrapper.current && !containerWrapper.current.contains(e.target)) {
        setDropdownActive(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (inputVal.trim().length < 2) {
      setPredictions([]);
      setDropdownActive(false);
      return;
    }

    const networkController = new AbortController();

    const executePredictionFetch = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/v1/courses/suggestions?q=${encodeURIComponent(inputVal)}`,
          { signal: networkController.signal }
        );
        const data = Array.isArray(res.data) ? res.data : [];
        setPredictions(data);
        if (data.length > 0) {
          setDropdownActive(true);
        }
        setFocusIndex(-1);
      } catch (err) {
        if (!axiosInstance.isCancel(err)) {
          console.error("[Search Pipeline Ingress Error]:", err);
        }
      }
    };

    // 150ms high-throughput debounce threshold
    const debounceTimer = setTimeout(executePredictionFetch, 150);

    return () => {
      clearTimeout(debounceTimer);
      networkController.abort(); // Drops stale network packets instantly
    };
  }, [inputVal]);

  const handleSelectionAction = (val) => {
    setInputVal(val);
    setDropdownActive(false);
    if (onExecuteSearch) onExecuteSearch(val);
  };

  const handleKeyDownMatrix = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (dropdownActive && focusIndex >= 0 && focusIndex < predictions.length) {
        handleSelectionAction(predictions[focusIndex].value);
      } else {
        handleSelectionAction(inputVal);
      }
      return;
    }

    if (!dropdownActive || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex((prev) => (prev + 1 >= predictions.length ? 0 : prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex((prev) => (prev - 1 < 0 ? predictions.length - 1 : prev - 1));
        break;
      case 'Escape':
        setDropdownActive(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerWrapper} className={`relative w-full ${className}`}>
      {/* Structural Input Shell Container with Integrated Action Controls */}
      <div className="flex items-center bg-[#14141A] border border-white/[0.08] rounded-xl pl-3.5 pr-1.5 py-1.5 focus-within:border-[#C5A880]/70 focus-within:ring-1 focus-within:ring-[#C5A880]/30 transition-all shadow-md">
        <span className="text-gray-400 mr-2.5 text-base select-none" aria-hidden="true">🔍</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDownMatrix}
          onFocus={() => inputVal.trim().length >= 2 && predictions.length > 0 && setDropdownActive(true)}
          placeholder={placeholder || "Search items by title, subtitle, tag category or author..."}
          className="w-full bg-transparent text-[#F5F5F7] outline-none placeholder-[#71717A] text-xs sm:text-sm font-light tracking-wide"
        />
        {inputVal && (
          <button 
            type="button"
            aria-label="Clear search"
            onClick={() => { setInputVal(''); setPredictions([]); setDropdownActive(false); if (onExecuteSearch) onExecuteSearch(''); }} 
            className="text-gray-500 hover:text-white transition-colors mr-1.5 p-1 cursor-pointer"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSelectionAction(inputVal)}
          className="px-3 py-1.5 rounded-lg bg-[#C5A880] hover:bg-[#D4B991] text-[#070709] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
          aria-label="Search"
        >
          <span>Search</span>
        </button>
      </div>

      {/* Floating Google-Like Projection UI Dropdown Overlay */}
      {dropdownActive && predictions.length > 0 && (
        <ul className="absolute left-0 w-full mt-2 bg-[#14141A] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden py-2 animate-fadeIn z-50 backdrop-blur-xl">
          {predictions.map((item, idx) => (
            <li
              key={`${item.type}-${item.value}-${idx}`}
              onClick={() => handleSelectionAction(item.value)}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-xs sm:text-sm transition-colors ${
                idx === focusIndex ? 'bg-[#C5A880]/15 text-[#F5F5F7]' : 'text-gray-300 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate mr-2">
                <span className="opacity-80 shrink-0 text-sm">
                  {item.type === 'TITLE' && '📘'}
                  {item.type === 'SUBTITLE' && '📖'}
                  {item.type === 'CATEGORY' && '🏷️'}
                  {item.type === 'INSTRUCTOR' && '👨‍🏫'}
                </span>
                <span className="font-light tracking-wide truncate">{item.value}</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] bg-[#C5A880]/10 px-2 py-0.5 rounded border border-[#C5A880]/20 shrink-0">
                {item.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
