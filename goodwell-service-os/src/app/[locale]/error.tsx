"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950 text-center px-4">
      <p className="text-6xl font-bold text-zinc-200 dark:text-zinc-800">500</p>
      <h1 className="text-xl font-semibold">Xatolik yuz berdi</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Tizimda kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Qaytadan urinish
      </button>
    </div>
  );
}
