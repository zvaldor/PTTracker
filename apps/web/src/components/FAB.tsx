'use client';

import { PlusIcon } from '@heroicons/react/24/outline';

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95"
    >
      <PlusIcon className="w-6 h-6" />
    </button>
  );
}
