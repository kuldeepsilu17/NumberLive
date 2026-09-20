import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Game } from '@/types';

interface GameFaqProps {
  game: Game;
}

export default function GameFaq({ game }: GameFaqProps) {
  const faqs = [
    {
      q: `When is the official ${game.name} result published?`,
      a: `The ${game.name} number result is officially scheduled for release at ${game.resultTime} IST. NumberLive updates the ledger record immediately upon verified public announcement.`,
    },
    {
      q: `Where does the data for ${game.name} come from?`,
      a: `NumberLive records publicly announced numbers from regional market notice boards strictly for historical documentation and statistical reference.`,
    },
    {
      q: `Can I place bets or wagers for ${game.name} on this website?`,
      a: `No. NumberLive is strictly an open public records archive. We do not provide, facilitate, or host betting, wagering, gambling, or monetary games of any kind.`,
    },
    {
      q: `Are there fixed or leak numbers available for ${game.name}?`,
      a: `No. Any claims of "fixed numbers" or "sure shot predictions" are fraudulent. NumberLive advises visitors to beware of deceptive third parties soliciting money for fake tips.`,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#111113] rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 shadow-subtle space-y-4">
      <div className="flex items-center gap-2 border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2.5">
        <HelpCircle className="w-4 h-4 text-[#C5A059]" />
        <h3 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-wide">
          Frequently Asked Questions: {game.name}
        </h3>
      </div>

      <div className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33] space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="pt-3 first:pt-0">
            <h4 className="text-xs sm:text-[13px] font-bold text-[#111113] dark:text-[#FAF8F5] mb-1">
              {faq.q}
            </h4>
            <p className="text-[11.5px] sm:text-xs text-[#5C5449] dark:text-[#A1A1AA] leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
