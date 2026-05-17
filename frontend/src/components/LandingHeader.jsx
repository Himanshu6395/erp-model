import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { LANDING_PRIMARY_LINKS } from "../data/landingNav";
import { SITE_BRAND, SITE_CONTACT } from "../config/siteContact";

function LandingHeader() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-gray-950/90 via-gray-900/88 to-gray-950/90 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav
          className="flex h-16 items-center justify-between sm:h-[4.25rem]"
          aria-label="Primary"
        >
          <Link
            to="/"
            className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
            onClick={() => setNavOpen(false)}
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-brand-400 via-teal-400/80 to-brand-600 opacity-60 blur-md transition duration-300 group-hover:opacity-90" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/25 to-white/[0.07] text-lg font-bold text-white shadow-inner ring-1 ring-white/25 backdrop-blur-sm transition group-hover:ring-white/40">
                📊
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span className="bg-gradient-to-r from-white to-white/85 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                {SITE_BRAND.name}
              </span>
              <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-teal-300/90 sm:block">
                School ERP
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.06] p-1 backdrop-blur-md lg:flex">
            {LANDING_PRIMARY_LINKS.map(({ label, to: href }) => (
              <Link
                key={href}
                to={href}
                className="rounded-full px-3 py-2 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
                onClick={() => setNavOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="group relative hidden lg:block">
              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/25 hover:bg-white/[0.1]"
              >
                <Phone className="h-3.5 w-3.5 text-cyan-300" />
                Contact
              </button>

              <div className="absolute right-0 top-full mt-3 hidden w-80 rounded-3xl border border-white/10 bg-gray-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl group-focus-within:block group-hover:block">
                <div className="space-y-3 text-sm">
                  <a
                    href={SITE_CONTACT.phoneHref}
                    className="flex items-start gap-3 rounded-2xl px-3 py-2.5 text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <span>
                      <span className="block text-[0.68rem] uppercase tracking-[0.2em] text-white/40">Call</span>
                      {SITE_CONTACT.phoneDisplay}
                    </span>
                  </a>
                  <a
                    href={SITE_CONTACT.mailtoHref}
                    className="flex items-start gap-3 rounded-2xl px-3 py-2.5 text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                    <span>
                      <span className="block text-[0.68rem] uppercase tracking-[0.2em] text-white/40">Email</span>
                      {SITE_CONTACT.email}
                    </span>
                  </a>
                  <a
                    href={SITE_CONTACT.addressHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-2xl px-3 py-2.5 text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>
                      <span className="block text-[0.68rem] uppercase tracking-[0.2em] text-white/40">Visit</span>
                      {SITE_CONTACT.addressLine}
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="hidden rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 shadow-sm transition hover:border-white/35 hover:bg-white/10 sm:inline-flex"
            >
              Login
            </Link>
            <Link
              to="/get-started"
              className="hidden items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-md transition hover:bg-gray-100 sm:inline-flex"
            >
              Get Started
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/15 lg:hidden"
              aria-expanded={navOpen}
              aria-controls="landing-mobile-nav"
              aria-label={navOpen ? "Close menu" : "Open menu"}
              onClick={() => setNavOpen((o) => !o)}
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <div
          id="landing-mobile-nav"
          className={`border-t border-white/10 lg:hidden ${navOpen ? "block" : "hidden"}`}
        >
          <div className="flex flex-col gap-1 py-4">
            {LANDING_PRIMARY_LINKS.map(({ label, to: href }) => (
              <Link
                key={href}
                to={href}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                onClick={() => setNavOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/login"
              className="mt-1 rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={() => setNavOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/get-started"
              className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 transition hover:bg-gray-100"
              onClick={() => setNavOpen(false)}
            >
              Get Started
            </Link>
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/80">
              <a href={SITE_CONTACT.phoneHref} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.08]">
                <Phone className="h-4 w-4 text-cyan-300" />
                {SITE_CONTACT.phoneDisplay}
              </a>
              <a href={SITE_CONTACT.mailtoHref} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.08]">
                <Mail className="h-4 w-4 text-red-300" />
                {SITE_CONTACT.email}
              </a>
              <a
                href={SITE_CONTACT.addressHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.08]"
              >
                <MapPin className="mt-0.5 h-4 w-4 text-emerald-300" />
                <span>{SITE_CONTACT.addressLine}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;
