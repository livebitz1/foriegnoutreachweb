// Low-fidelity wireframe of the full landing page structure — layout and
// content hierarchy only, no real copy/colors/imagery. Placeholder blocks
// stand in for text, buttons, and images so the section order and buildup
// toward the "Book a Call" CTA can be reviewed before visual design.

function Tag({ children }: { children: string }) {
  return (
    <span className="absolute left-0 top-0 -translate-y-full rounded-t bg-gray-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

function TextBar({ w = "w-full" }: { w?: string }) {
  return <div className={`h-3 ${w} rounded bg-gray-300`} />;
}

function ImageBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-100 text-[11px] uppercase tracking-wide text-gray-400 ${className}`}
    >
      Image
    </div>
  );
}

function ButtonBox({
  label,
  filled = false,
  className = "",
}: {
  label: string;
  filled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex h-10 items-center justify-center rounded-full border border-gray-400 px-6 text-xs font-medium uppercase tracking-wide ${
        filled ? "bg-gray-800 text-white" : "bg-white text-gray-500"
      } ${className}`}
    >
      {label}
    </div>
  );
}

function EyebrowPill({ w = "w-32" }: { w?: string }) {
  return (
    <div
      className={`h-7 ${w} rounded-full border border-gray-300 bg-white`}
    />
  );
}

function PlusSeparator() {
  return <span className="text-gray-300">+</span>;
}

function TagChip({ w, rotate = 0 }: { w: string; rotate?: number }) {
  return (
    <div
      className={`flex h-8 ${w} items-center justify-center rounded-full border border-gray-300 bg-white text-[9px] text-gray-400`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      tag
    </div>
  );
}

function Decoration() {
  return (
    <div className="h-6 w-6 shrink-0 rotate-12 rounded-sm border border-gray-300 bg-white" />
  );
}

function PinnedCard({
  num,
  title,
  top,
  left,
  rotate,
}: {
  num: string;
  title: string;
  top: string;
  left: string;
  rotate: number;
}) {
  return (
    <div
      className="absolute w-56 md:w-64"
      style={{ top, left, transform: `rotate(${rotate}deg)` }}
    >
      {/* Pin dot */}
      <div className="absolute -top-3 left-1/2 z-10 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white bg-gray-500 shadow" />
      <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-md">
        <span className="text-xs font-semibold text-gray-400">{num}</span>
        <span className="text-base font-bold text-gray-800">{title}</span>
        <div className="flex flex-col gap-1.5">
          <TextBar w="w-full" />
          <TextBar w="w-full" />
          <TextBar w="w-4/5" />
        </div>
      </div>
    </div>
  );
}

// Shared header pattern for the Portfolio/Reviews sections: a small muted
// paragraph on the left, an eyebrow pill + left-aligned headline on the
// right.
function SplitHeader() {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="flex max-w-[220px] flex-col gap-2">
        <TextBar w="w-full" />
        <TextBar w="w-full" />
        <TextBar w="w-2/3" />
      </div>
      <div className="flex flex-col items-start gap-3 md:max-w-md">
        <EyebrowPill w="w-24" />
        <div className="flex flex-col gap-2">
          <div className="h-6 w-72 rounded bg-gray-800" />
          <div className="h-6 w-40 rounded bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

function Section({
  tag,
  className = "",
  children,
}: {
  tag: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`relative mt-10 border border-gray-300 p-6 md:p-10 ${className}`}>
      <Tag>{tag}</Tag>
      {children}
    </section>
  );
}

export default function WireframePage() {
  return (
    <div className="min-h-screen w-full bg-white px-4 py-16 text-gray-800 md:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Landing Page — Wireframe
        </h1>
        <p className="mb-10 text-xs text-gray-400">
          Layout only. No copy, color, or imagery is final.
        </p>

        {/* NAVBAR */}
        <Section tag="Navbar">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-gray-300" />
            <div className="hidden items-center gap-6 md:flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <TextBar key={i} w="w-14" />
              ))}
            </div>
            <ButtonBox label="Book a Call" filled />
          </div>
        </Section>

        {/* HERO — no image, matches the current live site: centered,
            single-column, real headline/subtext copy in the actual
            display font instead of abstract gray bars. */}
        <Section tag="1. Hero — Hook">
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <EyebrowPill w="w-40" />

            <h2 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 md:text-6xl">
              We craft brands &amp; digital experiences
            </h2>

            <p className="max-w-md text-sm text-gray-500 md:text-base">
              Elevate your brand with exceptional design solutions — from
              branding to UI, we bring your vision to life.
            </p>

            <ButtonBox label="Let's Talk" filled />
          </div>

          {/* Logo strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-gray-200 pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-5 w-16 rounded bg-gray-200" />
                {i < 4 && <PlusSeparator />}
              </div>
            ))}
          </div>
        </Section>

        {/* ABOUT / MEET US */}
        <Section tag="2. About — Meet the Team">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            {/* Left: eyebrow, headline, copy */}
            <div className="flex flex-col gap-4">
              <EyebrowPill w="w-24" />
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-2">
                  <div className="h-7 w-80 rounded bg-gray-800" />
                  <div className="h-7 w-40 rounded bg-gray-800" />
                </div>
                <Decoration />
              </div>
              <div className="flex flex-col gap-2">
                <TextBar w="w-full" />
                <TextBar w="w-full" />
                <TextBar w="w-full" />
                <TextBar w="w-3/4" />
              </div>
            </div>

            {/* Right: image, with a small decoration overlapping its
                top-left corner */}
            <div className="relative">
              <div className="absolute -left-3 -top-3 z-10">
                <Decoration />
              </div>
              <ImageBox className="aspect-square w-full" />
            </div>
          </div>

          {/* Bottom row: wide stat card with scattered tags; a second,
              smaller image is layered on top, staggered down and to the
              right so it overlaps the card's bottom-right corner. */}
          <div className="relative mt-8 pb-16 md:pb-20">
            <div className="flex h-72 w-full flex-col justify-between rounded-2xl bg-gray-800 p-6 md:w-[68%]">
              <div className="flex flex-col gap-2">
                <div className="h-9 w-24 rounded bg-white/90" />
                <TextBar w="w-36" />
              </div>
              <div className="flex flex-wrap gap-2 pr-0 md:w-[80%]">
                <TagChip w="w-24" rotate={-4} />
                <TagChip w="w-20" rotate={2} />
                <TagChip w="w-20" rotate={-2} />
                <TagChip w="w-28" rotate={3} />
                <TagChip w="w-16" rotate={-3} />
                <TagChip w="w-24" rotate={1} />
              </div>
            </div>

            <ImageBox className="absolute bottom-0 right-0 z-10 h-40 w-[85%] translate-y-10 md:h-44 md:w-[45%] md:translate-y-14" />
          </div>
        </Section>

        {/* PROCESS */}
        <Section tag="3. Process — How We Work">
          {/* Heading */}
          <div className="flex flex-col gap-3">
            <EyebrowPill w="w-28" />
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-2">
                <div className="h-6 w-80 rounded bg-gray-800" />
                <div className="h-6 w-64 rounded bg-gray-800" />
              </div>
              <Decoration />
            </div>
            <div className="flex flex-col gap-1.5">
              <TextBar w="w-56" />
              <TextBar w="w-52" />
              <TextBar w="w-40" />
            </div>
          </div>

          {/* Desktop/tablet: staggered zigzag with pin-dot connectors */}
          <div className="relative mt-10 hidden h-[780px] w-full md:block">
            {/* Dashed connectors, roughly linking each pin dot to the next */}
            <div className="absolute left-[38%] top-[12%] h-40 w-40 -translate-x-1/2 rotate-[35deg] border-b-2 border-dashed border-gray-300" />
            <div className="absolute left-[27%] top-[40%] h-40 w-40 -translate-x-1/2 -rotate-[35deg] border-b-2 border-dashed border-gray-300" />
            <div className="absolute left-[38%] top-[62%] h-40 w-40 -translate-x-1/2 rotate-[35deg] border-b-2 border-dashed border-gray-300" />

            <PinnedCard num="01" title="Define" top="4%" left="52%" rotate={5} />
            <PinnedCard num="02" title="Design" top="24%" left="6%" rotate={-6} />
            <PinnedCard num="03" title="Build" top="48%" left="46%" rotate={5} />
            <PinnedCard num="04" title="Launch" top="68%" left="4%" rotate={-6} />

            <div className="absolute bottom-2 right-[8%] flex items-center gap-2 text-xs italic text-gray-400">
              <span className="h-px w-8 border-t border-dashed border-gray-300" />
              Ready to be delivered!
            </div>
          </div>

          {/* Mobile: simple stacked fallback (no absolute zigzag) */}
          <div className="mt-8 flex flex-col gap-6 md:hidden">
            {["Define", "Design", "Build", "Launch"].map((label, i) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm"
              >
                <span className="text-xs font-semibold text-gray-400">
                  0{i + 1}
                </span>
                <span className="text-base font-bold text-gray-800">
                  {label}
                </span>
                <TextBar w="w-full" />
                <TextBar w="w-4/5" />
              </div>
            ))}
          </div>
        </Section>

        {/* SELECTED WORK / PROJECTS */}
        <Section tag="4. Portfolio — Selected Work" className="bg-gray-50">
          <SplitHeader />

          {/* Card row — 3 full cards, 4th peeks in and is clipped by the
              section edge, hinting at horizontal scroll/carousel. */}
          <div className="mt-10 flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex w-64 shrink-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <TextBar w="w-24" />
                    <TextBar w="w-16" />
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs text-white">
                    ↗
                  </div>
                </div>
                <div className="relative h-40 w-full">
                  <ImageBox className="absolute inset-2 translate-x-3 translate-y-2 opacity-60" />
                  <ImageBox className="absolute inset-0" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <ButtonBox label="See all projects →" filled className="w-fit" />
          </div>
        </Section>

        {/* SOCIAL PROOF */}
        <Section tag="5. Reviews — Social Proof" className="bg-gray-50">
          <SplitHeader />

          {/* Single large testimonial */}
          <div className="mt-10 grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
            <ImageBox className="h-40 w-32 rounded-[45%] md:h-56 md:w-44" />
            <div className="flex flex-col gap-4">
              <span className="text-4xl leading-none text-gray-300">
                &ldquo;
              </span>
              <div className="flex flex-col gap-2">
                <TextBar w="w-full" />
                <TextBar w="w-full" />
                <TextBar w="w-full" />
                <TextBar w="w-full" />
                <TextBar w="w-1/2" />
              </div>
              <div className="flex flex-col gap-1">
                <TextBar w="w-20" />
                <TextBar w="w-24" />
              </div>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-gray-800" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
          </div>
        </Section>

        {/* FINAL CTA */}
        <Section tag="6. Final CTA — The Ask" className="bg-gray-50">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="h-6 w-1/2 max-w-sm rounded bg-gray-400" />
            <TextBar w="w-1/3" />
            <ButtonBox label="Book a Call" filled />
          </div>
        </Section>

        {/* FOOTER */}
        <Section tag="Footer">
          <div className="grid gap-8 sm:grid-cols-4">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-20 rounded bg-gray-300" />
              <TextBar w="w-24" />
            </div>
            {Array.from({ length: 3 }).map((_, col) => (
              <div key={col} className="flex flex-col gap-2">
                <TextBar w="w-16" />
                <TextBar w="w-20" />
                <TextBar w="w-14" />
                <TextBar w="w-20" />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
