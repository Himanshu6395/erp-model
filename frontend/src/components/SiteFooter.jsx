import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Send, ChevronUp, MapPin, Phone, Mail, Clock } from "lucide-react";

const TOPO_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='none' stroke='%23ffffff' stroke-opacity='0.07' stroke-width='0.4' d='M0 50 Q25 25 50 50 T100 50 M0 30 Q30 10 60 30 T100 30 M0 70 Q35 90 70 70 T100 70'/%3E%3C/svg%3E\")";

const quickLinks = [
  { label: "About us", to: "/about" },
  { label: "Our services", to: "/services" },
  { label: "Advantages of school ERP", to: "/advantages" },
  { label: "FAQ", to: "/faq" },
  { label: "Career", to: "/career" },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function SiteFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const onNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }
    toast.success("Thanks—you’ll hear from us when there’s news.");
    setNewsletterEmail("");
  };

  return (
    <footer className="relative text-gray-200">
      <div
        className="relative border-t border-white/10 bg-[#1c1c1e] py-14 sm:py-16"
        style={{ backgroundImage: TOPO_BG }}
      >
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-1 lg:max-w-sm">
              <Link to="/" className="inline-flex items-center gap-3 outline-none" onClick={scrollToTop}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-900/40">
                  <span className="flex flex-col items-center gap-1.5 py-1">
                    <span className="h-0.5 w-6 rounded-full bg-white" />
                    <span className="h-0.5 w-4 rounded-full bg-white/90" />
                    <span className="h-0.5 w-5 rounded-full bg-white" />
                  </span>
                </div>
                <span className="text-lg font-bold tracking-tight text-white">NEXUSCRM</span>
              </Link>
              <p className="mt-5 text-sm leading-relaxed text-gray-400">
                Amplify your school with credible cloud-based school management software. Digitise and
                automate day-to-day academic and administrative work—attendance, fees, homework,
                notices, and role-based dashboards for your whole institution.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-white">
                Contact information
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-gray-400">
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                  <span>
                    <span className="font-semibold text-gray-300">A: </span>
                    B 57, East Jyoti Nagar, Shahdra, Delhi 110093
                  </span>
                </li>
                <li className="flex gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                  <span>
                    <span className="font-semibold text-gray-300">M: </span>
                    <a href="tel:+917827565682" className="transition hover:text-white">
                      +91 78275 65682
                    </a>
                  </span>
                </li>
                <li className="flex gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                  <span>
                    <span className="font-semibold text-gray-300">E: </span>
                    <a
                      href="mailto:schoolerp2004@gmail.com"
                      className="break-all transition hover:text-white"
                    >
                      schoolerp2004@gmail.com
                    </a>
                  </span>
                </li>
                <li className="flex gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                  <span>
                    <span className="font-semibold text-gray-300">T: </span>
                    10 AM – 6 PM
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-white">Quick links</h3>
              <ul className="mt-5 space-y-2.5 text-sm">
                {quickLinks.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-gray-400 transition hover:text-red-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-white">Newsletter</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                You will be notified when something new appears.
              </p>
              <form onSubmit={onNewsletter} className="mt-4 flex max-w-xs">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email Address *"
                  className="min-w-0 flex-1 rounded-l-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center justify-center rounded-r-lg bg-red-600 px-3.5 text-white transition hover:bg-red-700"
                  aria-label="Subscribe"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl border-t border-white/10 px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-xs text-gray-500 sm:text-left">
              Copyright © {new Date().getFullYear()} NexusCRM School ERP. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-xs font-medium">
              <Link to="/privacy-policy" className="text-gray-400 transition hover:text-white">
                Privacy Policy
              </Link>
              <span className="text-gray-600" aria-hidden>
                |
              </span>
              <Link to="/terms" className="text-gray-400 transition hover:text-white">
                Terms and Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-[60] flex h-11 w-11 items-center justify-center rounded-md bg-red-600 text-white shadow-lg shadow-red-900/40 transition hover:bg-red-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </footer>
  );
}

export default SiteFooter;
