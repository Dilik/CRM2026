import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950 text-center px-4">
      <p className="text-6xl font-bold text-zinc-200 dark:text-zinc-800">404</p>
      <h1 className="text-xl font-semibold">Sahifa topilmadi</h1>
      <Link
        href="/uz-Latn/login"
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
