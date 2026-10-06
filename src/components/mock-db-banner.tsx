"use client";

import { resetMockDb } from "~/lib/db.mock";

/** Shown only in mock mode so nobody mistakes local fake data for production. */
export function MockDbBanner() {
  return (
    <div className="fixed bottom-[88px] left-3 md:bottom-3 z-50 flex items-center gap-2 rounded-md border border-amber-400 bg-amber-100 px-3 py-1.5 text-xs text-amber-900 shadow">
      <span className="font-semibold">MOCK DATA</span>
      <span className="opacity-70">not connected to Supabase</span>
      <button
        className="rounded border border-amber-500 px-2 py-0.5 hover:bg-amber-200"
        onClick={() => {
          resetMockDb();
          window.location.reload();
        }}
      >
        Reset
      </button>
    </div>
  );
}
