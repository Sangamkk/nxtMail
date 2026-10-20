
import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Search, Mail, Check,
  Clock, ShieldCheck, Menu
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#FAF9F5] text-[#29372D]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          nxt<span className="text-[#527957]">Mail</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-[#778276] md:flex">
          <a href="#features" className="hover:text-[#355B42]">Features</a>
          <a href="#about" className="hover:text-[#355B42]">About</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#EDF2E7]"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-[#355B42] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#294A34]"
          >
            Get started <ArrowRight size={15} className="ml-1 inline" />
          </Link>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-2">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DFE8D8] bg-[#EDF3E7] px-4 py-2 text-xs font-medium text-[#496B4E]">
              <Sparkles size={14} />
              Your inbox, made smarter
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              Email, with a little more{" "}
              <span className="text-[#64876A]">intelligence.</span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-[#778276]">
              A calmer inbox. Smarter replies. Less time managing email,
              more time for what matters.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="rounded-xl bg-[#355B42] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#294A34]"
              >
                Get started free <ArrowRight size={16} className="ml-2 inline" />
              </Link>
              <Link
                to="/signin"
                className="rounded-xl border border-[#DDE4D7] bg-white px-6 py-3.5 text-sm font-medium transition hover:bg-[#F0F4EA]"
              >
                I have an account
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#778276]">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#64876A}" />
                Simple by design
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#64876A]" />
                Built around Gmail
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[40px] bg-[#E6EEDC]/70 blur-2xl" />

            <div className="relative rounded-3xl border border-[#E4E8DE] bg-white p-5 shadow-[0_24px_80px_-35px_rgba(53,91,66,0.25)] sm:p-7">
              <div className="flex items-center justify-between border-b border-[#EDF0E8] pb-5">
                <div>
                  <p className="text-lg font-semibold">Your inbox</p>
                  <p className="mt-1 text-xs text-[#899389]">A little more organized.</p>
                </div>
                <div className="rounded-xl bg-[#E8F0E2] p-3 text-[#496B4E]">
                  <Mail size={20} />
                </div>
              </div>

              <div className="my-5 flex items-center gap-3 rounded-xl bg-[#F5F7F1] px-4 py-3 text-sm text-[#9AA398]">
                <Search size={17} />
                Search your emails
              </div>

              <div className="space-y-2">
                {[
                  { icon: Sparkles, title: "AI-powered summaries", desc: "Get to the point, faster" },
                  { icon: Mail, title: "Smarter replies", desc: "Find the right words" },
                  { icon: Clock, title: "Follow-up reminders", desc: "Keep things moving" },
                  { icon: ShieldCheck, title: "Your connected inbox", desc: "Work with your Gmail" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-4 rounded-2xl p-4 transition hover:bg-[#F5F7F1]">
                    <div className="rounded-xl bg-[#EAF0E5] p-3 text-[#547957]">
                      <Icon size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="mt-1 text-xs text-[#899389]">{desc}</p>
                    </div>
                    <ArrowRight size={15} className="ml-auto text-[#A3AEA0]" />
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-[#EAF1E5] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#355B42]">
                  <Sparkles size={16} />
                  Less inbox clutter. More clarity.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-[#E7E9DF] bg-[#F3F5ED]">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
            <div className="max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64876A]">
                Made for your workflow
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything you need.
                <span className="block text-[#64876A]">Nothing you don't.</span>
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Sparkles, title: "AI summaries", desc: "Understand long email threads in less time." },
                { icon: Mail, title: "Smart replies", desc: "Draft thoughtful responses with AI assistance." },
                { icon: Clock, title: "Follow-ups", desc: "Keep track of emails that need your attention." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-[#E3E8DE] bg-white p-6">
                  <div className="mb-5 inline-flex rounded-xl bg-[#EAF0E5] p-3 text-[#547957]">
                    <Icon size={21} />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#778276]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="px-6 py-16 text-center md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight">
            Make room for what matters.
          </h2>
          <Link
            to="/signup"
            className="mt-7 inline-flex items-center rounded-xl bg-[#355B42] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#294A34]"
          >
            Get started <ArrowRight size={16} className="ml-2" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-[#E7E9DF] px-6 py-6 text-center text-xs text-[#899389]">
        © {new Date().getFullYear()} nxtMail
      </footer>
    </div>
  );
}
