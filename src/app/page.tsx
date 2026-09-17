"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import {
  Compass,
  Sparkles,
  Palette,
  Rocket,
  Star,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Mail,
  Users,
  ArrowUp,
  Check,
  Copy,
  Layers,
  Code2,
  Crown,
} from "lucide-react";
import { Marquee } from "@/components/marquee";

const navLinks = [
  { label: "Overview", href: "#hero" },
  { label: "Services", href: "#services" },
  { label: "Tech Stack", href: "#strategy" },
  { label: "Client Proof", href: "#testimonials" },
  { label: "Team", href: "#team" },
  { label: "Contact", href: "mailto:hello@algrowmedia.com" },
];

const cards = [
  {
    rotate: -24,
    y: 6,
    bg: "bg-gray-200",
    img: "https://i.pinimg.com/736x/94/b3/30/94b330332cbb3368f1ca6a69f79f6429.jpg",
  },
  {
    rotate: -16,
    y: 2,
    bg: "bg-gray-200",
    img: "https://i.pinimg.com/736x/c5/38/59/c538599e25b1740f84f333805741a18a.jpg",
  },
  {
    rotate: -8,
    y: 0,
    bg: "bg-gray-200",
    img: "https://i.pinimg.com/736x/f2/a8/f1/f2a8f1bc77bd324eee44c495928d8280.jpg",
  },
  {
    rotate: 0,
    y: -2,
    bg: "bg-gray-200",
    img: "https://i.pinimg.com/736x/14/2b/db/142bdbd78ea1fe61354042c95099daa0.jpg",
  },
  {
    rotate: 8,
    y: 0,
    bg: "bg-gray-200",
    img: "https://i.pinimg.com/736x/1a/c9/33/1ac933dda6c7ad2a058494aa45d64d2b.jpg",
  },
  {
    rotate: 16,
    y: 2,
    bg: "bg-gray-200",
    img: "https://i.pinimg.com/1200x/48/67/16/4867161b39b00ac7a733fdcd25f95df8.jpg",
  },
  {
    rotate: 24,
    y: 6,
    bg: "bg-gray-200",
    img: "https://i.pinimg.com/736x/09/cf/83/09cf83424c3ca09e1f0d5426355a5c03.jpg",
  },
];

// A slower, more "settling" ease-out — no spring/bounce, just a gentle
// deceleration into the resting position. Used for the entrance sequence.
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

// A snappier ease-out used once the fan has settled, for hover reactions.
const HOVER_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Extra tilt (deg) each card starts rotated beyond its final angle, so
// rotation visibly "corrects into place" during the entrance.
const EXTRA_TILT = 11;

const LEAD_ROTATE_EXTRA = -18;

// Card index 3 (the orange, center card) leads the sequence; the rest fan
// out around it once it has settled.
const LEAD_INDEX = 3;

const leadHiddenState = { opacity: 0, y: 100, rotate: LEAD_ROTATE_EXTRA };

type CardMotionProps = {
  y: number;
  rotate: number;
  initialRotate: number;
  scale: number;
  delay: number;
};

// Delay (seconds) between each center-out stagger group (3&5, then 2&6,
// then 1&7), spreading Phase 2 across ~1s total.
const PHASE_2_GROUP_STAGGER = 0.1;
const PHASE_2_CARD_DEFAULT_DURATION = 0.45;
const PHASE_2_CARD_ROTATE_DURATION = 0.5;

// Total time (seconds) for Phase 2 to fully settle: the outermost pair's
// delay plus its own animation duration. Used to know when hover can begin.
const PHASE_2_TOTAL_SECONDS =
  2 * PHASE_2_GROUP_STAGGER + PHASE_2_CARD_ROTATE_DURATION;

const otherCardVariants: Variants = {
  hidden: (props: CardMotionProps) => ({
    opacity: 0,
    y: 60,
    rotate: props.initialRotate,
    scale: props.scale,
  }),
  show: ({ y, rotate, scale, delay }: CardMotionProps) => ({
    opacity: 1,
    y,
    scale,
    rotate,
    transition: {
      default: { duration: PHASE_2_CARD_DEFAULT_DURATION, ease: EASE_OUT, delay },
      rotate: { duration: PHASE_2_CARD_ROTATE_DURATION, ease: EASE_OUT, delay },
    },
  }),
};

type CardMotionAttrs = Partial<ComponentProps<typeof motion.div>>;

// Section 2's four pillars — Lucide icons with subtle shine containers.
const pillars = [
  {
    label: "Architecture",
    delay: 0,
    icon: <Compass size={28} strokeWidth={1.5} />,
  },
  {
    label: "Full Stack Dev",
    delay: 0.3,
    icon: <Sparkles size={28} strokeWidth={1.5} />,
  },
  {
    label: "UI/UX Design",
    delay: 0.6,
    icon: <Palette size={28} strokeWidth={1.5} />,
  },
  {
    label: "Cloud & Scale",
    delay: 0.9,
    icon: <Rocket size={28} strokeWidth={1.5} />,
  },
];

const pillarsContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const pillarItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

// --- Responsive scaling --------------------------------------------------
//
// Below the `md` (768px) breakpoint, the whole scroll-linked coordinate
// system (card size, gather spread, explode targets) is scaled down by
// MOBILE_LAYOUT_SCALE so 7 cards — and the section-2 collage's pixel-based
// offsets — fit within a narrow viewport instead of overflowing it. At
// md+ the scale is exactly 1, so tablet/desktop math and layout are
// byte-for-byte unchanged from before.
const MOBILE_LAYOUT_SCALE = 0.64;
const MOBILE_ROTATION_SCALE = 0.8;
// Extra downward shift (pre-scale) applied to the section-2 collage's
// resting position on mobile, so it clears the stacked text block above it.
const MOBILE_COLLAGE_Y_SHIFT = 210;
// Center of the desktop collage spread (~285px), subtracted on mobile
// so the collage is centered horizontally beneath the stacked copy.
const MOBILE_COLLAGE_X_RECENTER = 285;

function useResponsiveMode() {
  const [mode, setMode] = useState({ isMobile: false, isTouch: false });

  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    function measure() {
      setMode({ isMobile: window.innerWidth < 768, isTouch });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return mode;
}

// --- Scroll-linked hero -> section 2 transition ------------------------
//
// scrollYProgress (0 -> 1) is split into three phases:
//   GATHER  0    -> 0.4  outer cards tuck in behind the lead card
//   TRAVEL  0.4  -> 0.8  the merged card drifts toward the collage area
//   EXPLODE 0.8  -> 1    5 of the 7 cards burst out into section 2's
//                        collage layout; the lead card becomes the large
//                        center card, the other 4 reappear at their own
//                        slot. Cards 1 and 7 (indices 0 and 6) are dropped
//                        — simplest way to reconcile 7 hero cards with a
//                        5-slot collage (see EXPLODE_TARGETS).
//
// All positioning here uses ONE shared coordinate system: each card is
// centered on the stage (absolute, left/top 50%, negative margins) and
// every phase is expressed as a translateX/Y offset (dx/dy in px) from
// that center, plus rotate/scaleX/scaleY/opacity — so GATHER, TRAVEL and
// EXPLODE all interpolate smoothly through the same values. On mobile,
// every px-based offset below is multiplied by `layoutScale` before use.

// Horizontal spacing (px) between adjacent cards' centers in their resting
// fan (card width minus overlap) — recreates the fan spread at the start of
// GATHER. Matches the md+ breakpoint's overlap (180 - 90 = 90), since that's
// the resting layout most users actually see; a mismatch here previously
// caused a visible snap the instant scrolling began.
const GATHER_STEP_PX = 180 - 90;

type ExplodeTarget = {
  dx: number;
  dy: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  z: number;
};

// Final section-2 collage layout, expressed as offsets from stage center.
// Indices 1, 2, 4, 5 are the "reused" outer cards; 3 is the lead card
// (becomes the large center card). 0 and 6 are dropped (never reappear).
const EXPLODE_TARGETS: Record<number, ExplodeTarget> = {
  0: { dx: 0, dy: 0, rotate: 0, scaleX: 1, scaleY: 1, z: 0 }, // dropped
  1: { dx: 80, dy: -140, rotate: -8, scaleX: 1.16, scaleY: 1.05, z: 15 }, // top-left
  2: { dx: 485, dy: -125, rotate: 7, scaleX: 1.12, scaleY: 1.02, z: 25 }, // top-right
  3: { dx: 285, dy: -10, rotate: 2, scaleX: 1.48, scaleY: 1.34, z: 35 }, // center (lead)
  4: { dx: 100, dy: 135, rotate: 7, scaleX: 1.16, scaleY: 1.05, z: 20 }, // bottom-left
  5: { dx: 470, dy: 130, rotate: -6, scaleX: 1.12, scaleY: 1.0, z: 18 }, // bottom-right
  6: { dx: 0, dy: 0, rotate: 0, scaleX: 1, scaleY: 1, z: 0 }, // dropped
};

const CARD_ROLES: Record<number, "lead" | "reused" | "dropped"> = {
  0: "dropped",
  1: "reused",
  2: "reused",
  3: "lead",
  4: "reused",
  5: "reused",
  6: "dropped",
};

const LEAD_ARC_Y = cards[LEAD_INDEX].y;

function getZIndexBase(i: number) {
  return 10 + (3 - Math.abs(i - 3)) * 10;
}

// Standardizes collage card elevation to its stacking order: the higher a
// card's EXPLODE z-index, the deeper its shadow reads, so depth feels
// intentional rather than uniformly flat.
function getCollageShadow(z: number) {
  if (z >= 30) return "shadow-[0_28px_65px_-12px_rgba(13,2,31,0.28),0_12px_28px_-6px_rgba(124,58,237,0.14)] border border-purple-500/25";
  if (z >= 20) return "shadow-[0_20px_45px_-10px_rgba(13,2,31,0.22),0_8px_18px_-4px_rgba(124,58,237,0.09)] border border-purple-500/18";
  return "shadow-[0_14px_32px_-8px_rgba(13,2,31,0.18)] border border-purple-500/12";
}

function useHeroScrollCard(
  scrollYProgress: MotionValue<number>,
  index: number,
  restingRotate: number,
  restingY: number,
  restingScale: number,
  zIndexBase: number,
  layoutScale: number,
  isMobile: boolean
) {
  const isCenter = index === LEAD_INDEX;
  const role = CARD_ROLES[index];
  const target = EXPLODE_TARGETS[index];
  const xSpread = (index - LEAD_INDEX) * GATHER_STEP_PX * layoutScale;
  const mobileYShift = isMobile ? MOBILE_COLLAGE_Y_SHIFT * layoutScale : 0;
  const mobileXRecenter = isMobile ? MOBILE_COLLAGE_X_RECENTER : 0;

  const mergeX = (EXPLODE_TARGETS[LEAD_INDEX].dx - mobileXRecenter) * layoutScale;
  const mergeY = EXPLODE_TARGETS[LEAD_INDEX].dy * layoutScale + mobileYShift;
  const leadArcY = LEAD_ARC_Y * layoutScale;

  const finalX =
    ((role === "dropped" ? EXPLODE_TARGETS[LEAD_INDEX].dx : target.dx) - mobileXRecenter) *
    layoutScale;
  const finalY =
    (role === "dropped" ? EXPLODE_TARGETS[LEAD_INDEX].dy : target.dy) * layoutScale +
    mobileYShift;
  const finalRotate = role === "dropped" ? 0 : target.rotate;
  const finalScaleX = role === "dropped" ? 1 : target.scaleX;
  const finalScaleY = role === "dropped" ? 1 : target.scaleY;
  const finalZ = role === "dropped" ? zIndexBase : target.z;

  const opacityValues =
    role === "lead"
      ? [1, 1, 1, 1, 1]
      : role === "dropped"
        ? [1, 1, 0, 0, 0]
        : [1, 1, 0, 0, 1];

  // GATHER's first breakpoint sits at 0.15 rather than jumping straight to
  // its 0.4 end value — the value there is only ~20% of the way toward the
  // 0.4 target (not the ~37.5% a single linear segment would reach by that
  // point), so the motion visibly ramps in gently instead of moving at a
  // constant rate from the very first scroll pixel.
  const GATHER_EASE_IN = 0.2;
  const gatherRotateAt15 = isCenter
    ? 0
    : restingRotate + GATHER_EASE_IN * (0 - restingRotate);
  const gatherXAt15 = isCenter ? 0 : xSpread + GATHER_EASE_IN * (0 - xSpread);
  const scaledRestingY = restingY * layoutScale;
  const gatherYAt15 = scaledRestingY + GATHER_EASE_IN * (leadArcY - scaledRestingY);

  const rotate = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.58, 0.78],
    isCenter
      ? [0, 0, 0, 0, finalRotate]
      : [restingRotate, gatherRotateAt15, 0, 0, finalRotate],
    { clamp: true }
  );

  const x = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.58, 0.78],
    isCenter ? [0, 0, 0, mergeX, finalX] : [xSpread, gatherXAt15, 0, mergeX, finalX],
    { clamp: true }
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.58, 0.78],
    [scaledRestingY, gatherYAt15, leadArcY, mergeY, finalY],
    { clamp: true }
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.30, 0.45, 0.62, 0.78],
    opacityValues,
    { clamp: true }
  );

  const scaleX = useTransform(
    scrollYProgress,
    [0, 0.58, 0.78],
    [restingScale, restingScale, finalScaleX],
    { clamp: true }
  );

  const scaleY = useTransform(
    scrollYProgress,
    [0, 0.58, 0.78],
    [restingScale, restingScale, finalScaleY],
    { clamp: true }
  );

  const zIndex = useTransform(scrollYProgress, (p) =>
    p < 0.60 ? zIndexBase : finalZ
  );

  return { rotate, x, y, opacity, scaleX, scaleY, zIndex };
}

interface ServiceItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  capabilities: string[];
  ctaLabel: string;
  inquirySubject: string;
  tagColor: string;
  iconColor: string;
  iconBgColor: string;
}

const servicesData: ServiceItem[] = [
  {
    id: "saas",
    badge: "01 SaaS & Cloud",
    title: "SaaS Development & MVP",
    subtitle: "From architecture to multi tenant production scale.",
    description:
      "We design, engineer, and deploy robust Software as a Service platforms. Complete with Stripe subscription billing, role based access, high throughput APIs, and enterprise cloud infrastructure.",
    icon: <Layers size={22} />,
    capabilities: [
      "Multi tenant Cloud Architecture",
      "Stripe & Subscription Billing Integration",
      "Secure Auth & Role Based Access Control",
      "PostgreSQL & Scalable API Pipelines",
      "Automated CI/CD & Zero Downtime Deployments",
    ],
    ctaLabel: "Start your SaaS",
    inquirySubject: "SaaS%20Development%20Project",
    tagColor: "border-purple-400/30 bg-purple-500/15 text-purple-200",
    iconColor: "text-purple-300",
    iconBgColor: "border-purple-400/30 bg-purple-500/15",
  },
  {
    id: "webapps",
    badge: "02 Web Applications",
    title: "Custom Web Applications",
    subtitle: "High performance digital products & dashboards.",
    description:
      "Full stack custom web applications engineered with Next.js App Router for sub second speeds, real time dashboards, interactive workflows, and bespoke business systems.",
    icon: <Code2 size={22} />,
    capabilities: [
      "Modern Next.js & React 19 Frontend",
      "Real Time Analytics & Admin Dashboards",
      "Custom Workflow & API Integrations",
      "Sub second Load Times & Edge Optimization",
      "Responsive Cross Device Experience",
    ],
    ctaLabel: "Build your Web App",
    inquirySubject: "Web%20Application%20Project",
    tagColor: "border-teal-400/30 bg-teal-500/15 text-teal-200",
    iconColor: "text-teal-300",
    iconBgColor: "border-teal-400/30 bg-teal-500/15",
  },
  {
    id: "personal-branding",
    badge: "03 Personal Branding",
    title: "Personal Branding & Authority",
    subtitle: "Turn your story into a high converting digital presence.",
    description:
      "We architect high converting personal brand platforms, founder storefronts, and authority driven websites that position you as an industry leader and channel inquiries straight to WhatsApp & CRM.",
    icon: <Crown size={22} />,
    capabilities: [
      "Founder & Creator Authority Hubs",
      "Direct WhatsApp & CRM Inbound Lead Capture",
      "Social Proof & High Trust Case Studies",
      "Bespoke Typographic & Visual Brand Identity",
      "Conversion Funnels for High Ticket Offers",
    ],
    ctaLabel: "Scale your Personal Brand",
    inquirySubject: "Personal%20Branding%20Inquiry",
    tagColor: "border-amber-400/30 bg-amber-500/15 text-amber-200",
    iconColor: "text-amber-300",
    iconBgColor: "border-amber-400/30 bg-amber-500/15",
  },
];

function ServicesSection() {
  return (
    <section
      id="services"
      className="relative w-full bg-dark-bg bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,#3b0764_0%,#1e0838_45%,var(--color-dark-bg)_85%)] py-20 sm:py-28 md:py-36 px-4 sm:px-6 md:px-8 overflow-hidden text-white"
    >
      {/* Top Smooth Transition Shade: Seamlessly dissolves from light section into deep purple */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 sm:h-44 md:h-56 bg-gradient-to-b from-[#f8f6fc] via-[#28084d]/60 via-40% to-transparent z-10" />

      {/* Bottom Smooth Transition Shade: Seamlessly dissolves from deep purple into next light section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-44 md:h-56 bg-gradient-to-t from-[#f8f6fc] via-[#28084d]/60 via-40% to-transparent z-10" />

      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] md:w-[800px] h-[400px] bg-purple-600/15 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-12 right-10 w-[300px] sm:w-[500px] h-[300px] bg-fuchsia-600/10 blur-[120px] rounded-full" />

      <div className="relative mx-auto max-w-[1280px] z-20">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 backdrop-blur-md px-3.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-purple-200 shadow-sm">
            <Sparkles size={13} className="text-purple-300 shrink-0" />
            <span>Our Core Capabilities</span>
          </div>

          <h2 className="mt-3.5 sm:mt-5 max-w-3xl font-display text-3xl sm:text-5xl md:text-6xl font-normal leading-[1.12] tracking-tight text-white">
            SaaS, Web Apps &amp;{" "}
            <span className="font-script text-4xl sm:text-6xl md:text-7xl font-normal italic text-purple-300 inline-block">
              Personal Branding
            </span>
            .
          </h2>

          <p className="mt-2.5 sm:mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white/70 leading-relaxed px-2">
            End to end technical engineering and brand authority services designed to scale your business, convert visitors, and establish market dominance.
          </p>
        </div>

        {/* 3-Column Services Grid */}
        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6 lg:gap-8">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 md:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.07] hover:border-purple-400/40 hover:ring-1 hover:ring-purple-400/30 hover:shadow-[0_16px_40px_-8px_rgba(124,58,237,0.25)]"
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${service.tagColor}`}
                  >
                    {service.badge}
                  </span>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${service.iconBgColor} ${service.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600/30 group-hover:text-white group-hover:border-purple-400/50 shadow-inner`}
                  >
                    {service.icon}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="mt-5">
                  <h3 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-white group-hover:text-purple-200 transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-[13px] font-normal text-purple-200/70 leading-snug">
                    {service.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="mt-3.5 text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                  {service.description}
                </p>

                {/* Capability Checklist */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    What&apos;s Included
                  </span>
                  {service.capabilities.map((cap) => (
                    <div key={cap} className="flex items-start gap-2 text-xs sm:text-[13px] text-white/85">
                      <CheckCircle2
                        size={15}
                        className="text-teal-400 shrink-0 mt-0.5"
                      />
                      <span className="leading-snug">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-white/10">
                <a
                  href={`mailto:hello@algrowmedia.com?subject=${service.inquirySubject}`}
                  className="group/btn inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-cream-button px-5 py-2.5 text-xs sm:text-sm font-semibold text-dark-bg transition-all duration-200 hover:bg-purple-50 hover:scale-[1.02] shadow-md shadow-purple-950/40"
                >
                  <span>{service.ctaLabel}</span>
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type TestimonialCategory = "all" | "stores" | "agencies" | "creators";

interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  company: string;
  quote: string;
  category: "stores" | "agencies" | "creators";
  categoryLabel: string;
}

const testimonialsData: TestimonialItem[] = [
  {
    id: "1",
    author: "Rohan",
    role: "Store Owner",
    company: "UniqueHub",
    quote:
      "We sell everything from home decor to gadgets. Algrow Media let us list every category without touching a single line of code.",
    category: "stores",
    categoryLabel: "Multi category store",
  },
  {
    id: "2",
    author: "Priya",
    role: "Founder",
    company: "PriyaMobilePark",
    quote:
      "Every order comes straight to our WhatsApp now. No more missed calls, no more confusion with customers.",
    category: "stores",
    categoryLabel: "Mobiles & accessories",
  },
  {
    id: "3",
    author: "Ajay",
    role: "Agency Partner",
    company: "Scalisite",
    quote:
      "We built Ajay with our agency, Scalisite, and the experience was smooth from strategy to launch. The platform gave us a polished storefront that feels premium and easy to manage.",
    category: "agencies",
    categoryLabel: "Agency built store",
  },
  {
    id: "4",
    author: "Ananya",
    role: "Creator & Founder",
    company: "AstroJewels",
    quote:
      "I wanted a simple way to share my astrology inspired bracelets with customers online. Algrow Media made it easy to showcase my products and turn inquiries into orders through WhatsApp.",
    category: "creators",
    categoryLabel: "Astrology & Jewelry",
  },
];

const testimonialCategories = [
  { id: "all", label: "All", fullLabel: "All Stories" },
  { id: "stores", label: "Stores", fullLabel: "Retail & Stores" },
  { id: "agencies", label: "Agencies", fullLabel: "Agency Built" },
  { id: "creators", label: "Creators", fullLabel: "Creators & D2C" },
] as const;

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div
      key={item.id}
      className="group relative flex w-[320px] sm:w-[380px] md:w-[420px] flex-col justify-between rounded-2xl sm:rounded-3xl border border-stone-200/90 bg-white/95 p-5 sm:p-7 md:p-8 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-300 hover:bg-white hover:border-accent-purple/40 hover:ring-2 hover:ring-accent-purple/10 hover:shadow-[0_12px_32px_-8px_rgba(124,58,237,0.09)]"
    >
      <div>
        {/* Top Bar: Stars + Category Badge */}
        <div className="flex items-center justify-between gap-2">
          {/* 5-Star Rating */}
          <div className="flex items-center gap-1 text-amber-400 shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className="fill-amber-400 text-amber-400 sm:w-4 sm:h-4"
              />
            ))}
          </div>

          {/* Category Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-accent-maroon border border-purple-200/70 shrink-0">
            <Sparkles size={11} className="text-accent-maroon shrink-0" />
            <span>{item.categoryLabel}</span>
          </div>
        </div>

        {/* Quote Content */}
        <div className="mt-4 sm:mt-5">
          <p className="font-normal text-neutral-800 leading-relaxed tracking-[-0.01em] transition-colors duration-200 group-hover:text-neutral-950 text-[14px] sm:text-[15.5px] md:text-base">
            &ldquo;{item.quote}&rdquo;
          </p>
        </div>
      </div>

      {/* Author Card Footer */}
      <div className="mt-5 sm:mt-7 flex items-center justify-between border-t border-stone-100 pt-3.5 sm:pt-4 gap-3">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight truncate">
              {item.author}
            </span>
            <CheckCircle2
              size={14}
              className="text-teal-600 fill-teal-50 shrink-0"
            />
          </div>
          <span className="text-xs sm:text-[13px] text-neutral-500 font-normal leading-tight mt-0.5 truncate">
            Store: <strong className="font-semibold text-neutral-800">{item.company}</strong>
          </span>
        </div>

        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-stone-100/90 text-neutral-400 transition-all duration-200 group-hover:bg-accent-maroon group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 shadow-2xs">
          <ArrowUpRight size={13} className="sm:w-3.5 sm:h-3.5" />
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const [activeCategory, setActiveCategory] =
    useState<TestimonialCategory>("all");

  const filteredTestimonials = useMemo(() => {
    if (activeCategory === "all") return testimonialsData;
    return testimonialsData.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const firstRow = useMemo(() => filteredTestimonials, [filteredTestimonials]);
  const secondRow = useMemo(() => [...filteredTestimonials].reverse(), [filteredTestimonials]);

  return (
    <section id="testimonials" className="relative w-full bg-light-bg py-12 sm:py-20 md:py-28 px-4 sm:px-6 md:px-8 overflow-hidden">
      {/* Subtle ambient gradient decor */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] md:w-[800px] h-[350px] bg-gradient-to-b from-accent-maroon/15 via-purple-500/5 to-transparent blur-3xl opacity-60" />

      <div className="relative mx-auto max-w-[1280px]">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-accent-maroon/20 bg-accent-maroon/5 px-3.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-accent-maroon shadow-sm">
            <Sparkles size={13} className="text-accent-maroon shrink-0" />
            <span>Proven Client Results</span>
          </div>

          <h2 className="mt-3.5 sm:mt-5 max-w-3xl font-display text-3xl sm:text-5xl md:text-6xl font-normal leading-[1.12] tracking-tight text-neutral-900">
            Software that turns vision into{" "}
            <span className="font-script text-4xl sm:text-6xl md:text-7xl font-normal italic text-accent-maroon inline-block">
              revenue
            </span>
            .
          </h2>

          <p className="mt-2.5 sm:mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed px-2">
            Real feedback from founders, store owners, and agencies who launched and scaled their web apps with us.
          </p>

          {/* Category Filter Tabs with responsive mobile container */}
          <div className="mt-6 sm:mt-10 w-full flex justify-center px-2">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-neutral-200/80 border border-neutral-300/80 backdrop-blur-sm">
              {testimonialCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`relative min-h-[34px] sm:min-h-[38px] px-3 sm:px-5 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTestimonialTab"
                        className="absolute inset-0 rounded-full bg-dark-bg shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 sm:hidden">{cat.label}</span>
                    <span className="relative z-10 hidden sm:inline">{cat.fullLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Continuous Infinite Scrolling Testimonials Marquee */}
        <div className="relative mt-8 sm:mt-14 w-full overflow-hidden flex flex-col gap-4 sm:gap-6">
          {/* Left & Right gradient edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 md:w-48 bg-gradient-to-r from-light-bg via-light-bg/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 md:w-48 bg-gradient-to-l from-light-bg via-light-bg/80 to-transparent z-10" />

          {/* Top Marquee Row (Brisk 18s continuous loop) */}
          <Marquee pauseOnHover repeat={4} className="[--duration:18s] [--gap:1.25rem] py-1 sm:py-2">
            {firstRow.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </Marquee>

          {/* Bottom Marquee Row (Reverse Direction, 20s continuous loop) */}
          <Marquee reverse pauseOnHover repeat={4} className="[--duration:20s] [--gap:1.25rem] py-1 sm:py-2">
            {secondRow.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </Marquee>
        </div>

        {/* Bottom Social Proof & CTA Banner */}
        <div className="mt-12 sm:mt-16 rounded-2xl sm:rounded-3xl border border-purple-300/30 bg-gradient-to-r from-dark-bg via-[#260a48] to-dark-bg p-6 sm:p-8 md:p-10 shadow-xl text-white">
          <div className="flex flex-col items-center justify-between gap-6 sm:gap-8 md:flex-row text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-2 w-full md:w-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 border border-purple-400/20 px-3 py-1 text-xs font-semibold text-purple-200">
                <Sparkles size={13} className="text-purple-300 shrink-0" />
                <span>Production Ready Web Apps</span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white">
                  Ready to build your next web app or SaaS?
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-white/70 max-w-xl">
                  Turn your product idea into a high performance, production ready platform with our full stack engineering team.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
              <a
                href="mailto:hello@algrowmedia.com?subject=SaaS%20Project%20Inquiry"
                className="min-h-[44px] sm:min-h-[46px] w-full sm:w-auto rounded-full bg-cream-button px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-dark-bg transition-all duration-200 hover:brightness-105 hover:scale-[1.02] shadow-md text-center flex items-center justify-center"
              >
                Start Your Project
              </a>
              <a
                href="#strategy"
                className="min-h-[44px] sm:min-h-[46px] w-full sm:w-auto flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors text-center"
              >
                Explore Tech Stack
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  tags: string[];
  linkedin?: string;
  twitter?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Rohan Patel",
    role: "Lead Software Architect",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    bio: "Architects scalable full stack applications, Next.js web apps, and resilient cloud infrastructure for fast growing SaaS products.",
    tags: ["Full Stack Architecture", "Next.js & React", "System Design"],
    linkedin: "#",
    twitter: "#",
    email: "rohan@algrowmedia.com",
  },
  {
    id: "2",
    name: "Dr. Aris Thorne",
    role: "Principal Backend Engineer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
    bio: "Specializes in high throughput APIs, PostgreSQL database architecture, payment integrations, and microservices security.",
    tags: ["Distributed Systems", "REST & GraphQL", "Database Scale"],
    linkedin: "#",
    twitter: "#",
    email: "aris@algrowmedia.com",
  },
  {
    id: "3",
    name: "Klara Jensen",
    role: "Lead UI/UX & Frontend Architect",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
    bio: "Crafts intuitive SaaS user experiences, design systems, and responsive web application interfaces that convert users into active customers.",
    tags: ["Product UI/UX", "Design Systems", "Web Performance"],
    linkedin: "#",
    twitter: "#",
    email: "klara@algrowmedia.com",
  },
];

function TeamSection() {
  return (
    <section id="team" className="relative w-full bg-light-bg py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 border-t border-purple-100/80 overflow-hidden">
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute -top-40 right-1/4 w-[400px] sm:w-[600px] h-[350px] bg-gradient-to-b from-accent-maroon/15 via-purple-500/5 to-transparent blur-3xl opacity-60" />

      <div className="relative mx-auto max-w-[1280px]">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-accent-maroon/20 bg-accent-maroon/5 px-3.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-accent-maroon shadow-sm">
            <Users size={13} className="text-accent-maroon shrink-0" />
            <span>Engineering &amp; Product Leadership</span>
          </div>

          <h2 className="mt-4 sm:mt-5 max-w-3xl font-display text-3xl sm:text-5xl md:text-6xl font-normal leading-[1.12] tracking-tight text-neutral-900">
            Crafted by engineers, for{" "}
            <span className="font-script text-4xl sm:text-6xl md:text-7xl font-normal italic text-accent-maroon inline-block">
              founders
            </span>
            .
          </h2>

          <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed px-2">
            No junior handoffs or bloated agency overhead. You collaborate directly with senior technical architects and product designers dedicated to shipping your SaaS.
          </p>
        </div>

        {/* 3-Member Grid */}
        <div className="mt-10 sm:mt-14 md:mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6 lg:gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-300 hover:bg-white hover:border-accent-maroon/35 hover:ring-2 hover:ring-accent-maroon/10 hover:shadow-[0_16px_36px_-8px_rgba(92,18,32,0.1)]"
            >
              {/* Member Portrait Image Container */}
              <div>
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-100 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Soft bottom vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" />

                  {/* Floating role pill badge on bottom of image */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white/95 border border-white/20 shadow-sm">
                      <Sparkles size={11} className="text-amber-300 shrink-0" />
                      {member.role}
                    </span>
                  </div>
                </div>

                {/* Info & Bio */}
                <div className="mt-4 sm:mt-5 px-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 transition-colors duration-200 group-hover:text-accent-maroon">
                      {member.name}
                    </h3>
                  </div>

                  <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                    {member.bio}
                  </p>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {member.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-stone-100/90 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-neutral-600 border border-stone-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social / Contact Links Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 px-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Connect
                </span>

                <div className="flex items-center gap-1.5">
                  <a
                    href={member.linkedin}
                    aria-label={`${member.name} LinkedIn`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100/90 text-neutral-500 transition-all duration-200 hover:bg-accent-maroon hover:text-white hover:scale-105"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </a>
                  <a
                    href={member.twitter}
                    aria-label={`${member.name} X / Twitter`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100/90 text-neutral-500 transition-all duration-200 hover:bg-accent-maroon hover:text-white hover:scale-105"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    aria-label={`Email ${member.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100/90 text-neutral-500 transition-all duration-200 hover:bg-accent-maroon hover:text-white hover:scale-105"
                  >
                    <Mail size={13} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("hello@algrowmedia.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative w-full bg-dark-bg bg-[radial-gradient(ellipse_at_center,var(--color-dark-bg-glow)_0%,var(--color-dark-bg)_75%)] text-white overflow-hidden pt-20 sm:pt-28 md:pt-36 pb-12 px-4 sm:px-6 md:px-8">
      {/* Top Smooth Transition Shade from Team light section into Footer dark purple */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 sm:h-44 md:h-56 bg-gradient-to-b from-[#f8f6fc] via-[#28084d]/60 via-40% to-transparent z-10" />

      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[500px] bg-accent-maroon/15 blur-[120px] rounded-full" />

      <div className="relative mx-auto max-w-[1280px] z-20">
        {/* Top Grand CTA Banner */}
        <div className="flex flex-col items-center text-center pb-14 sm:pb-20 border-b border-white/10">
          <h2 className="max-w-4xl font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.05] tracking-tight text-white">
            Let&apos;s build your{" "}
            <span className="font-script text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal italic text-white/90 inline-block">
              software
            </span>
            .
          </h2>

          <p className="mt-4 sm:mt-6 max-w-xl text-sm sm:text-base md:text-lg text-white/70 leading-relaxed px-2">
            Ready to launch your high performance web app, MVP, or SaaS? Let&apos;s map out your technical architecture and product roadmap.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <a
              href="mailto:hello@algrowmedia.com?subject=Technical%20Discovery%20Call%20Inquiry"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-cream-button px-8 py-3.5 text-sm sm:text-base font-semibold text-dark-bg transition-all duration-200 hover:brightness-105 hover:scale-[1.02] shadow-lg text-center"
            >
              Schedule a Technical Discovery Call →
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-xs sm:text-sm font-medium text-white/90 hover:bg-white/10 hover:border-white/35 transition-all text-center"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-teal-400" />
                  <span>Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-white/60" />
                  <span>hello@algrowmedia.com</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Footer Links & Information Grid */}
        <div className="py-12 sm:py-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 border-b border-white/10">
          {/* Col 1: Brand & Positioning */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <a href="#hero" className="flex items-center gap-2 w-fit">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-teal-500"
              >
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <path
                  d="M8 12.5L10.5 15L16 9"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xl font-bold tracking-tight text-white hover:text-teal-400 transition-colors">
                Algrow Media
              </span>
            </a>

            <p className="max-w-sm text-xs sm:text-sm text-white/65 leading-relaxed font-normal">
              High performance SaaS engineering, custom web applications, and personal branding studio. We architect, build, and ship production ready digital products and authority platforms.
            </p>

            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="inline-block h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Available for new projects worldwide</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Navigation
            </span>
            <ul className="mt-1 flex flex-col gap-2.5 text-xs sm:text-sm text-white/60">
              {[
                { label: "Overview", href: "#hero" },
                { label: "Services", href: "#services" },
                { label: "Tech Stack", href: "#strategy" },
                { label: "Client Proof", href: "#testimonials" },
                { label: "Start a Project", href: "mailto:hello@algrowmedia.com" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors duration-200 hover:text-white hover:translate-x-0.5 inline-block"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Direct Contact */}
          <div className="flex flex-col gap-3 lg:col-span-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Get in Touch
            </span>
            <ul className="mt-1 flex flex-col gap-2.5 text-xs sm:text-sm text-white/60">
              <li>
                <a
                  href="mailto:hello@algrowmedia.com?subject=New%20Project%20Inquiry"
                  className="group/chan flex flex-col transition-colors duration-200 hover:text-white"
                >
                  <span className="text-[11px] uppercase tracking-wider text-white/40 group-hover/chan:text-teal-400">
                    Project Inquiries &amp; Discovery
                  </span>
                  <span className="text-sm font-medium text-white/90 group-hover/chan:text-white">
                    hello@algrowmedia.com
                  </span>
                </a>
              </li>
              <li>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-white/40">
                    Response Commitment
                  </span>
                  <span className="text-xs text-white/70">
                    Replies within 24 hours
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Algrow Media. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a
              href="mailto:hello@algrowmedia.com?subject=Privacy%20Inquiry"
              className="hover:text-white transition-colors"
            >
              Contact &amp; Privacy
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<"lead" | "settle">("lead");
  // True once the entrance sequence has fully finished — hover interactions
  // are only enabled after this, so they never interrupt/replay the intro.
  const [interactive, setInteractive] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isMobile, isTouch } = useResponsiveMode();
  const layoutScale = isMobile ? MOBILE_LAYOUT_SCALE : 1;
  const rotationScale = isMobile ? MOBILE_ROTATION_SCALE : 1;
  const scaledCards = cards.map((card) => ({
    ...card,
    rotate: card.rotate * rotationScale,
  }));
  const cardBaseWidth = 180 * layoutScale;
  const cardBaseHeight = 240 * layoutScale;

  useEffect(() => {
    if (phase !== "settle") return;
    const timer = setTimeout(
      () => setInteractive(true),
      PHASE_2_TOTAL_SECONDS * 1000
    );
    return () => clearTimeout(timer);
  }, [phase]);

  // Scroll-linked transition zone bridging the hero card fan into section 2.
  // scrollYProgress runs 0 -> 1 across this container's full height, driven
  // purely by scroll position (reversible, no time-based animation).
  const transitionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: transitionRef,
    offset: ["start start", "end end"],
  });

  // Once the user has scrolled into the transition zone at all, the cards
  // switch from the hover-reactive resting state to the scroll-driven one.
  // This keeps hover fully working at scroll progress 0 without fighting
  // the scroll transform for the same properties.
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setScrolled(value > 0.001);
  });

  // Hero text & CTA are fully unmounted once scrolled past 0.12 to guarantee
  // they never ghost or reappear during the travel or explode stages.
  const [heroTextVisible, setHeroTextVisible] = useState(true);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setHeroTextVisible(value < 0.12);
  });

  // The GATHER/TRAVEL supporting copy is ONLY mounted during the travel phase (0.12 -> 0.58).
  // At scroll progress 0 (< 0.12), it is 100% unmounted so it can never overlap with the hero text.
  const [travelCopyVisible, setTravelCopyVisible] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setTravelCopyVisible(value >= 0.12 && value < 0.58);
  });

  // Hero text & CTA graceful scroll dissolve transforms
  const heroHeadlineOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.12, 1],
    [1, 0.2, 0, 0],
    { clamp: true }
  );
  const heroHeadlineY = useTransform(
    scrollYProgress,
    [0, 0.12, 1],
    [0, -28, -28],
    { clamp: true }
  );
  const heroHeadlineScale = useTransform(
    scrollYProgress,
    [0, 0.12, 1],
    [1, 0.96, 0.96],
    { clamp: true }
  );

  const heroCtaOpacity = useTransform(
    scrollYProgress,
    [0, 0.06, 0.10, 1],
    [1, 0.2, 0, 0],
    { clamp: true }
  );
  const heroCtaY = useTransform(
    scrollYProgress,
    [0, 0.10, 1],
    [0, 20, 20],
    { clamp: true }
  );
  const heroCtaScale = useTransform(
    scrollYProgress,
    [0, 0.10, 1],
    [1, 0.96, 0.96],
    { clamp: true }
  );
  const heroCtaPointerEvents = useTransform(scrollYProgress, (v) => (v > 0.08 ? "none" : "auto"));

  // Supporting copy on the empty left side during GATHER/TRAVEL.
  const travelLine1Opacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.22, 0.28],
    [0, 1, 1, 0]
  );
  const travelLine1Y = useTransform(
    scrollYProgress,
    [0, 0.05, 0.28],
    [20, 0, 0]
  );
  const travelLine2Opacity = useTransform(
    scrollYProgress,
    [0.30, 0.35, 0.46, 0.52],
    [0, 1, 1, 0]
  );
  const travelLine2Y = useTransform(
    scrollYProgress,
    [0.30, 0.35, 0.52],
    [20, 0, 0]
  );

  // Mobile 3-beat word reveal transforms ("Architect." -> "Engineer." -> "Deploy.")
  const word1Opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.20, 0.26, 0.30, 1],
    [0, 0, 1, 1, 0, 0],
    { clamp: true }
  );
  const word1Scale = useTransform(
    scrollYProgress,
    [0, 0.15, 0.20, 0.30, 1],
    [0.92, 0.92, 1, 1.06, 1.06],
    { clamp: true }
  );

  const word2Opacity = useTransform(
    scrollYProgress,
    [0, 0.30, 0.35, 0.42, 0.46, 1],
    [0, 0, 1, 1, 0, 0],
    { clamp: true }
  );
  const word2Scale = useTransform(
    scrollYProgress,
    [0, 0.30, 0.35, 0.46, 1],
    [0.92, 0.92, 1, 1.06, 1.06],
    { clamp: true }
  );

  const word3Opacity = useTransform(
    scrollYProgress,
    [0, 0.46, 0.50, 0.54, 0.58, 1],
    [0, 0, 1, 1, 0, 0],
    { clamp: true }
  );
  const word3Scale = useTransform(
    scrollYProgress,
    [0, 0.46, 0.50, 0.58, 1],
    [0.92, 0.92, 1, 1.06, 1.06],
    { clamp: true }
  );

  // Section 2 light background overlay opacity: 0 at hero, then
  // smoothly fades to 1 as cards explode into section 2.
  const section2BgOpacity = useTransform(
    scrollYProgress,
    [0, 0.45, 0.65, 1],
    [0, 0, 1, 1],
    { clamp: true }
  );

  // Section 2 chrome (text column, badges, pillars, CTA buttons) fades in
  // as cards explode and stays fully visible all the way through Section 2.
  const section2ContentOpacity = useTransform(
    scrollYProgress,
    [0, 0.55, 0.72, 1],
    [0, 0, 1, 1],
    { clamp: true }
  );
  const section2ContentX = useTransform(
    scrollYProgress,
    [0, 0.55, 0.72, 1],
    [-20, -20, 0, 0],
    { clamp: true }
  );

  // Unrolled (not looped) so each card gets a stable set of hook call sites.
  const scrollStates = [
    useHeroScrollCard(
      scrollYProgress,
      0,
      scaledCards[0].rotate,
      cards[0].y,
      1,
      getZIndexBase(0),
      layoutScale,
      isMobile
    ),
    useHeroScrollCard(
      scrollYProgress,
      1,
      scaledCards[1].rotate,
      cards[1].y,
      1,
      getZIndexBase(1),
      layoutScale,
      isMobile
    ),
    useHeroScrollCard(
      scrollYProgress,
      2,
      scaledCards[2].rotate,
      cards[2].y,
      1,
      getZIndexBase(2),
      layoutScale,
      isMobile
    ),
    useHeroScrollCard(
      scrollYProgress,
      3,
      scaledCards[3].rotate,
      cards[3].y,
      1.05,
      getZIndexBase(3),
      layoutScale,
      isMobile
    ),
    useHeroScrollCard(
      scrollYProgress,
      4,
      scaledCards[4].rotate,
      cards[4].y,
      1,
      getZIndexBase(4),
      layoutScale,
      isMobile
    ),
    useHeroScrollCard(
      scrollYProgress,
      5,
      scaledCards[5].rotate,
      cards[5].y,
      1,
      getZIndexBase(5),
      layoutScale,
      isMobile
    ),
    useHeroScrollCard(
      scrollYProgress,
      6,
      scaledCards[6].rotate,
      cards[6].y,
      1,
      getZIndexBase(6),
      layoutScale,
      isMobile
    ),
  ];

  function getCardMotionAttrs(
    i: number,
    card: (typeof scaledCards)[number],
    isCenter: boolean,
    scale: number,
    zIndexBase: number
  ): CardMotionAttrs {
    const restingRotate = isCenter ? 0 : card.rotate;
    const restingY = card.y;

    if (isCenter && phase === "lead") {
      return {
        initial: leadHiddenState,
        animate: { opacity: 1, y: 0, rotate: 0, scale },
        transition: {
          default: { duration: 1.6, ease: EASE_OUT },
          rotate: { duration: 2, ease: EASE_OUT },
        },
        onAnimationComplete: () => setPhase("settle"),
        style: { zIndex: zIndexBase },
      };
    }

    if (!interactive) {
      if (isCenter) {
        return {
          animate: { opacity: 1, y: restingY, rotate: 0, scale },
          transition: { duration: 0.2, ease: EASE_OUT },
          style: { zIndex: zIndexBase },
        };
      }

      const distance = Math.abs(i - LEAD_INDEX);
      const delay = (distance - 1) * PHASE_2_GROUP_STAGGER;
      const initialRotate =
        card.rotate + Math.sign(card.rotate) * EXTRA_TILT;

      return {
        variants: otherCardVariants,
        initial: "hidden",
        animate: phase === "settle" ? "show" : "hidden",
        custom: { y: card.y, rotate: card.rotate, initialRotate, scale, delay },
        style: { zIndex: zIndexBase },
      };
    }

    // Fully settled — hover-reactive resting state (tap-to-expand on touch).
    const isActive = hoveredIndex === i;
    const isReceding = hoveredIndex !== null && hoveredIndex !== i;

    let target = { opacity: 1, y: restingY, rotate: restingRotate, scale, x: 0 };
    let zIndex = zIndexBase;

    if (isActive) {
      target = {
        opacity: 1,
        y: restingY - 20,
        rotate: restingRotate * 0.3,
        scale: 1.08,
        x: 0,
      };
      zIndex = 50;
    } else if (isReceding) {
      const distance = Math.abs(i - hoveredIndex!);
      const direction = i < hoveredIndex! ? -1 : 1;
      target = {
        opacity: 1,
        y: restingY,
        rotate: restingRotate,
        scale: 0.96,
        x: direction * (12 + (distance - 1) * 4),
      };
    }

    const interactionHandlers = isTouch
      ? {
          onTap: () =>
            setHoveredIndex((prev) => (prev === i ? null : i)),
        }
      : {
          onHoverStart: () => setHoveredIndex(i),
          onHoverEnd: () =>
            setHoveredIndex((prev) => (prev === i ? null : prev)),
        };

    return {
      animate: target,
      transition: { duration: 0.3, ease: HOVER_EASE },
      style: { zIndex },
      ...interactionHandlers,
    };
  }

  return (
    <div id="hero" className="min-h-full w-full bg-light-bg">
      <div className="relative w-full bg-dark-bg bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#4c1d95_0%,#260a4e_45%,var(--color-dark-bg)_85%)]">
        {/* Top Navbar */}
        <header className="absolute top-0 inset-x-0 z-50 w-full py-5 bg-transparent">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
            <nav className="flex items-center justify-between">
              {/* Logo with subtle hover scale micro-interaction */}
              <div className="group flex cursor-pointer items-center gap-2 transition-transform duration-200 ease-out hover:scale-[1.03]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-teal-500 transition-transform duration-200 group-hover:rotate-6"
                >
                  <circle cx="12" cy="12" r="10" fill="currentColor" />
                  <path
                    d="M8 12.5L10.5 15L16 9"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[18px] font-bold text-white transition-colors duration-200 group-hover:text-white">
                  Algrow Media
                </span>
              </div>

              {/* Nav links with animated underline */}
              <div className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="group relative flex items-center gap-1.5 py-1 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    <span>{link.label}</span>
                    {/* Animated underline */}
                    <span className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-white/90 to-white/50 transition-transform duration-250 ease-out group-hover:scale-x-100" />
                  </a>
                ))}
              </div>

              {/* Right Side Actions: Desktop CTA + Mobile Hamburger */}
              <div className="flex items-center gap-3">
                <a
                  href="mailto:hello@algrowmedia.com?subject=SaaS%20Project%20Inquiry"
                  className="hidden min-h-[38px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-white/40 hover:bg-white/20 lg:inline-flex"
                >
                  Contact Us
                </a>

                {/* Hamburger — mobile & tablet only (nav links show at lg+). */}
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileMenuOpen}
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 shadow-sm transition-all duration-200 hover:scale-105 hover:border-white/35 hover:bg-white/20 hover:text-white lg:hidden"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </svg>
                </button>
              </div>
            </nav>
          </div>
        </header>



      {/* Mobile/tablet nav menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-dark-bg lg:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
            <span className="text-[18px] font-bold text-white">
              Algrow Media
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 flex-col items-stretch gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-2 border-b border-white/10 text-lg text-white/80"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Scroll-linked transition zone: the hero's 7 cards gather, travel,
          and explode into section 2's collage as the user scrolls through
          this zone — one continuous set of elements, never two groups. */}
      <motion.div
        id="strategy"
        ref={transitionRef}
        className="relative flow-root h-[220vh] md:h-[260vh]"
      >
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          {/* Smooth Light Background Overlay for Section 2:
              At scroll progress 0 (hero), opacity is 0 so the hero's rich glowing
              radial gradient is 100% visible. Fades in smoothly as cards explode into section 2. */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[#f8f6fc] z-0"
            style={{ opacity: section2BgOpacity }}
          />

          <div className="relative mx-auto h-[570px] sm:h-[620px] md:h-[700px] lg:h-[740px] xl:h-[780px] max-h-[92vh] w-full max-w-[1280px] px-4 sm:px-6 md:px-8 flex items-center justify-center z-10">

            {/* Hero Headline - Dissolves sleekly upwards on scroll */}
            {heroTextVisible && (
              <motion.div
                className="pointer-events-none absolute inset-x-0 top-1 sm:top-3 md:top-3 lg:top-5 z-20 px-3 sm:px-4 text-center"
                style={{
                  opacity: heroHeadlineOpacity,
                  y: heroHeadlineY,
                  scale: heroHeadlineScale,
                }}
              >
                <h1 className="mx-auto max-w-4xl font-display text-[34px] sm:text-[42px] md:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-white">
                  We scale your business 10x.
                  <br />
                  Turn your story into authority.
                </h1>
              </motion.div>
            )}

            {/* Hero CTA & Trust Badges - Dissolves sleekly downwards on scroll */}
            {heroTextVisible && (
              <motion.div
                className="absolute inset-x-0 bottom-2 sm:bottom-4 md:bottom-4 lg:bottom-6 z-20 px-4 text-center"
                style={{
                  opacity: heroCtaOpacity,
                  y: heroCtaY,
                  scale: heroCtaScale,
                  pointerEvents: heroCtaPointerEvents,
                }}
              >
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
                  <a
                    href="mailto:hello@algrowmedia.com?subject=SaaS%20Project%20Inquiry"
                    className="min-h-[42px] sm:min-h-[46px] rounded-full bg-cream-button px-6 py-2.5 sm:px-8 sm:py-3 text-xs sm:text-base font-semibold text-dark-bg transition-all duration-200 hover:bg-purple-50 hover:scale-[1.02] shadow-lg shadow-purple-950/30 flex items-center justify-center"
                  >
                    Get started
                  </a>
                  <a
                    href="#testimonials"
                    className="flex min-h-[42px] sm:min-h-[46px] items-center text-xs sm:text-base text-white/70 underline-offset-4 hover:text-white hover:underline transition-colors"
                  >
                    See client results
                  </a>
                </div>

                {/* Trust Badge */}
                <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-white/70">
                  <ShieldCheck size={14} className="text-purple-300 shrink-0" />
                  <span>SaaS, Custom Web Apps &amp; Personal Branding</span>
                </div>

                {/* Scroll Cue Hint */}
                <div className="mt-2.5 sm:mt-3.5 flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-white/40 sm:text-xs">
                  <span>Scroll to explore</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="animate-bounce text-white/50"
                  >
                    <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.div>
            )}

              {/* Supporting copy synced to the same scrollYProgress driving
                  GATHER/TRAVEL — sits in the empty space opposite the card,
                  which merges toward the right (see MERGE_X). Desktop/
                  tablet only; the mobile stage recenters the card so there's
                  no consistent "empty side" to anchor this to. Unmounted
                  entirely (not just faded) well before EXPLODE begins, so
                  it can never linger behind section 2's own content. */}
              {travelCopyVisible && (
                <>
                  {/* Desktop supporting copy (left-anchored) */}
                  <div className="pointer-events-none absolute left-8 top-1/2 z-0 hidden w-full max-w-xs -translate-y-1/2 md:block">
                    <motion.p
                      className="absolute inset-x-0 top-0 font-display text-3xl leading-tight text-white/90 md:text-4xl"
                      style={{ opacity: travelLine1Opacity, y: travelLine1Y }}
                    >
                      From raw concept.
                    </motion.p>
                    <motion.p
                      className="absolute inset-x-0 top-0 font-display text-3xl leading-tight text-white/90 md:text-4xl"
                      style={{ opacity: travelLine2Opacity, y: travelLine2Y }}
                    >
                      To a production ready SaaS.
                    </motion.p>
                  </div>

                  {/* Mobile 3-beat word reveal */}
                  <div className="pointer-events-none absolute inset-x-0 top-14 sm:top-18 z-10 flex w-full justify-center px-4 text-center md:hidden">
                    <motion.div
                      className="absolute font-display text-4xl sm:text-5xl font-bold tracking-tight text-white/90"
                      style={{ opacity: word1Opacity, scale: word1Scale }}
                    >
                      Architect.
                    </motion.div>
                    <motion.div
                      className="absolute font-display text-4xl sm:text-5xl font-bold tracking-tight text-white/90"
                      style={{ opacity: word2Opacity, scale: word2Scale }}
                    >
                      Engineer.
                    </motion.div>
                    <motion.div
                      className="absolute font-display text-4xl sm:text-5xl font-bold tracking-tight text-white/90"
                      style={{ opacity: word3Opacity, scale: word3Scale }}
                    >
                      Deploy.
                    </motion.div>
                  </div>
                </>
              )}

              {/* Section 2 text column — only appears once EXPLODE begins.
                  Stacked full-width above the collage on mobile; the
                  original left-anchored, vertically centered column at
                  md+ is unchanged. */}
              <motion.div
                className="absolute inset-x-0 top-1 px-3 sm:px-4 text-center md:inset-x-auto md:left-12 md:top-1/2 md:max-w-md md:-translate-y-1/2 md:px-0 md:text-left"
                style={{ opacity: section2ContentOpacity, x: section2ContentX }}
              >
                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 md:justify-start">
                  SaaS &amp; Web App Engineering
                </div>

                <h2 className="mt-2 sm:mt-4 font-display text-2xl sm:text-4xl md:text-6xl leading-tight tracking-tight">
                  <span className="block text-[#0d021f]">Build web apps</span>
                  <span className="block text-accent-maroon">that scale seamlessly,</span>
                  <span className="block text-[#0d021f]">and convert.</span>
                </h2>

                <motion.div
                  className="mx-auto mt-3.5 sm:mt-6 grid grid-cols-4 gap-2 sm:gap-3.5 md:mx-0 md:max-w-md md:gap-4"
                  variants={pillarsContainerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                >
                  {pillars.map((pillar) => (
                    <motion.div
                      key={pillar.label}
                      variants={pillarItemVariants}
                      className="group flex flex-col items-center gap-1.5 sm:gap-2 md:items-start"
                    >
                      <div className="relative flex h-10 w-10 sm:h-13 sm:w-13 md:h-15 md:w-15 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-accent-maroon/25 bg-gradient-to-br from-accent-maroon/12 via-purple-500/5 to-transparent shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-accent-maroon group-hover:shadow-md">
                        {/* Continuous subtle shine sweep overlay */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl">
                          <div
                            className="animate-icon-shine pointer-events-none absolute -inset-full h-[200%] w-[200%] bg-gradient-to-r from-transparent via-white/35 to-transparent"
                            style={{ animationDelay: `${pillar.delay}s` }}
                          />
                        </div>
                        <div className="relative z-10 text-accent-maroon transition-transform duration-300 group-hover:scale-110 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6 md:[&>svg]:w-7 md:[&>svg]:h-7">
                          {pillar.icon}
                        </div>
                      </div>
                      <span className="text-[8px] sm:text-[9.5px] md:text-[11px] font-medium uppercase tracking-wider text-gray-500 text-center md:text-left">
                        {pillar.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-4 sm:mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 md:justify-start md:gap-4">
                  <a
                    href="mailto:hello@algrowmedia.com?subject=SaaS%20Project%20Inquiry"
                    className="min-h-[40px] sm:min-h-[44px] rounded-full bg-dark-bg px-6 py-2 sm:px-8 sm:py-3 text-xs sm:text-base font-semibold text-white transition hover:bg-black hover:scale-[1.02] shadow-md flex items-center justify-center"
                  >
                    Start Your Project
                  </a>
                  <a
                    href="#testimonials"
                    className="flex min-h-[40px] sm:min-h-[44px] items-center text-xs sm:text-base text-gray-600 underline-offset-4 hover:text-dark-bg hover:underline transition-colors"
                  >
                    See client results
                  </a>
                </div>
              </motion.div>

              {/* The 7 hero cards — gather, travel, and explode into the
                  section-2 collage, all as the same elements. Shadow depth
                  is tied to each card's EXPLODE z-index for a consistent
                  sense of elevation, and each settled card lifts slightly
                  on hover/tap — same easing as the hero fan's hover. */}
              {scaledCards.map((card, i) => {
                const s = scrollStates[i];
                const collageShadow = getCollageShadow(
                  EXPLODE_TARGETS[i]?.z ?? 0
                );
                return (
                  <motion.div
                    key={i}
                    className={`absolute left-1/2 top-1/2 overflow-hidden rounded-2xl md:rounded-3xl ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:ring-purple-500/30 ${collageShadow} ${card.bg}`}
                    style={{
                      width: cardBaseWidth,
                      height: cardBaseHeight,
                      marginLeft: -cardBaseWidth / 2,
                      marginTop: -cardBaseHeight / 2,
                      x: s.x,
                      y: s.y,
                      rotate: s.rotate,
                      opacity: s.opacity,
                      scaleX: s.scaleX,
                      scaleY: s.scaleY,
                      zIndex: s.zIndex,
                    }}
                  >
                    <motion.div
                      className="h-full w-full"
                      whileHover={{ y: -10, scale: 1.04 }}
                      whileTap={{ y: -10, scale: 1.04 }}
                      transition={{ duration: 0.3, ease: HOVER_EASE }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.img}
                        alt=""
                        draggable={false}
                        className={`h-full w-full select-none object-cover ${
                          i === LEAD_INDEX ? "object-center" : "object-top"
                        }`}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

    {/* Section 3: Core Services Showcase (SaaS, Web Apps & Personal Branding) */}
    <ServicesSection />

    {/* Section 4: Testimonials & Social Proof Showcase */}
    <TestimonialsSection />

    {/* Section 5: Team Showcase */}
    <TeamSection />

    {/* Section 6: Footer & Grand Finale */}
    <FooterSection />
  </div>
  );
}
