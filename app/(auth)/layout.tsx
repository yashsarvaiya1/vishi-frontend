import { Wallet, CalendarDays, Users, ArrowUpRight } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh grid lg:grid-cols-2 bg-background">
      <aside className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-primary p-12 xl:p-16 text-primary-foreground">
        <div aria-hidden="true" className="absolute -right-36 -top-36 h-[32rem] w-[32rem] rounded-full border-[5rem] border-white/5" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black">V</span>
          <span className="text-2xl font-bold tracking-tight">Vishi</span>
        </div>
        <div className="relative max-w-lg py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
            <Users className="h-3.5 w-3.5" /> A shared journey. A clearer view.
          </span>
          <h2 className="mt-7 text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.08]">Together,<br />every cycle<br /><span className="text-white/65">counts.</span></h2>
          <p className="mt-6 text-base leading-relaxed text-white/75 max-w-sm">A simple place for your vishi groups, contributions and progress. Stay connected to every step.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/8 p-5"><Wallet className="h-5 w-5 mb-4 text-white/80" /><p className="text-sm font-semibold">Payments, in view</p><p className="mt-1 text-xs text-white/65 leading-relaxed">Know what is paid and what is due.</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/8 p-5"><CalendarDays className="h-5 w-5 mb-4 text-white/80" /><p className="text-sm font-semibold">Every cycle, clear</p><p className="mt-1 text-xs text-white/65 leading-relaxed">Follow your schedule and group progress.</p></div>
          </div>
        </div>
        <p className="relative text-xs text-white/60 flex items-center gap-2">Your money, together.<ArrowUpRight className="h-3.5 w-3.5" /></p>
      </aside>
      <section className="flex items-center justify-center min-w-0 px-5 py-10 sm:px-10 lg:py-16">
        {children}
      </section>
    </main>
  )
}
