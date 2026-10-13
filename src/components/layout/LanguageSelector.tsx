'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const pathname = usePathname();
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
          const activeIdx = SUPPORTED_LANGUAGES.findIndex(
            (lang) => lang.code === currentLanguage.code
          );
          setFocusedIndex(activeIdx >= 0 ? activeIdx : 0);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % SUPPORTED_LANGUAGES.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev <= 0 ? SUPPORTED_LANGUAGES.length - 1 : prev - 1
          );
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(SUPPORTED_LANGUAGES.length - 1);
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          break;
      }
    },
    [isOpen, currentLanguage.code]
  );

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        const activeIdx = SUPPORTED_LANGUAGES.findIndex(
          (lang) => lang.code === currentLanguage.code
        );
        setFocusedIndex(activeIdx >= 0 ? activeIdx : 0);
      }
      return next;
    });
  };

  if (pathname?.startsWith('/owner')) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none print:hidden"
    >
      {/* Dark Charcoal Language Menu Panel */}
      {isOpen && (
        <div
          ref={menuRef}
          id="language-picker-panel"
          role="listbox"
          aria-label="Languages"
          className="absolute bottom-[calc(100%+10px)] right-0 w-52 bg-[#18181B] border border-[#27272A] rounded-[8px] p-1.5 shadow-xl flex flex-col z-50 animate-in fade-in duration-150"
        >
          {SUPPORTED_LANGUAGES.map((lang, idx) => {
            const isSelected = currentLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-option-${lang.code}`}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                className={`w-full h-12 px-3 rounded-[6px] flex items-center justify-between text-left text-xs font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] ${
                  isSelected
                    ? 'bg-[#27272A] text-[#C5A059] font-bold border-l-2 border-[#C5A059]'
                    : 'text-[#E4E4E7] hover:bg-[#222226] hover:text-white'
                }`}
              >
                <span>{lang.name}</span>
                <span className="text-[11px] text-[#A1A1AA] uppercase font-mono">
                  {lang.shortCode}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Small Circular Bronze Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="language-picker-panel"
        aria-label={`Select language (current: ${currentLanguage.name})`}
        className="w-10 h-10 rounded-full bg-[#C5A059] hover:bg-[#B88E3E] text-[#111113] flex items-center justify-center shadow-md transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20201E]"
        title={`Language: ${currentLanguage.name}`}
      >
        <Globe className="w-4 h-4" />
      </button>
    </div>
  );
}
