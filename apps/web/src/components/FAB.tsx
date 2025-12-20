'use client';

import { PlusIcon } from '@heroicons/react/24/outline';

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 backdrop-blur-2xl bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/20 text-slate-900 dark:text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-white/60 dark:hover:bg-white/20"
    >
      <PlusIcon className="w-6 h-6 stroke-2" />
    </button>
  );
}
