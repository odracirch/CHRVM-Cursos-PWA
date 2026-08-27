import Link from 'next/link'

export default function AdminBackButton() {
  return (
    <Link
      href="/admin"
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      ← Panel administrativo
    </Link>
  )
}
