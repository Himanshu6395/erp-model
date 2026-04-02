function MarketingPageHero({ eyebrow, title, titleHighlight, subtitle }) {
  return (
    <section className="relative overflow-hidden border-b border-gray-800/20 bg-gradient-to-br from-gray-950 via-slate-900 to-brand-900 px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-teal-500/15 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300/90 sm:text-sm">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
          {titleHighlight && (
            <>
              {" "}
              <span className="bg-gradient-to-r from-teal-300 via-white to-brand-200 bg-clip-text text-transparent">
                {titleHighlight}
              </span>
            </>
          )}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

export default MarketingPageHero;
