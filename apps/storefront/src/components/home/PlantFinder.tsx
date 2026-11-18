"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Armchair,
  Check,
  Cloud,
  CloudSun,
  Flower2,
  House,
  Lamp,
  Leaf,
  type LucideIcon,
  PawPrint,
  Plus,
  RotateCcw,
  Sprout,
  Sun,
  SunDim,
  Trees,
  Unlink,
  Wind,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { SectionLabel } from "@/components/ui/RevealText";
import { findMatches, type Answers, type Match } from "@vanam/catalog";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { cn, formatINR, img, IMAGES } from "@/lib/utils";

type Option<K extends keyof Answers> = { value: NonNullable<Answers[K]>; label: string; hint: string; icon: LucideIcon };
type Step<K extends keyof Answers = keyof Answers> = { key: K; question: string; options: Option<K>[] };

const steps = [
  {
    key: "light",
    question: "How much light does your spot get?",
    options: [
      { value: "low", label: "Barely any", hint: "Hallways, north-facing rooms", icon: Cloud },
      { value: "medium", label: "Soft & indirect", hint: "A few feet from a window", icon: CloudSun },
      { value: "bright", label: "Bright", hint: "Right beside a big window", icon: SunDim },
      { value: "sun", label: "Direct sun", hint: "Balcony, terrace, south sill", icon: Sun },
    ],
  } satisfies Step<"light">,
  {
    key: "space",
    question: "Where will your plant live?",
    options: [
      { value: "desk", label: "Tabletop", hint: "Desks, shelves, side tables", icon: Lamp },
      { value: "floor", label: "On the floor", hint: "A statement in the corner", icon: Armchair },
      { value: "hanging", label: "Hanging", hint: "Trailing from a hook or shelf", icon: Wind },
      { value: "outdoor", label: "Outdoors", hint: "Balcony, terrace or garden", icon: Trees },
    ],
  } satisfies Step<"space">,
  {
    key: "pets",
    question: "Any curious pets or little ones?",
    options: [
      { value: true, label: "Yes — keep it safe", hint: "Only non-toxic plants", icon: PawPrint },
      { value: false, label: "No, all clear", hint: "Show me everything", icon: House },
    ],
  } satisfies Step<"pets">,
  {
    key: "care",
    question: "How green is your thumb?",
    options: [
      { value: 1, label: "Just starting", hint: "I need something forgiving", icon: Sprout },
      { value: 2, label: "Some experience", hint: "I keep a few plants happy", icon: Leaf },
      { value: 3, label: "Plant obsessive", hint: "Bring on the divas", icon: Flower2 },
    ],
  } satisfies Step<"care">,
] as Step[];

const ease = [0.16, 1, 0.3, 1] as const;

export function PlantFinder() {
  const { products } = useCatalog();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<"quiz" | "thinking" | "results">("quiz");
  const [matches, setMatches] = useState<Match[]>([]);

  const step = steps[stepIndex];

  const choose = (value: Answers[keyof Answers]) => {
    const next = { ...answers, [step.key]: value } as Answers;
    setAnswers(next);
    if (stepIndex < steps.length - 1) {
      setTimeout(() => setStepIndex((i) => i + 1), 280);
    } else {
      setPhase("thinking");
      setMatches(findMatches(products, next));
      setTimeout(() => setPhase("results"), 1500);
    }
  };

  const restart = () => {
    setAnswers({});
    setStepIndex(0);
    setPhase("quiz");
  };

  const progress = phase === "quiz" ? stepIndex / steps.length : 1;

  return (
    <section id="finder" className="relative overflow-hidden py-[clamp(5rem,10vw,9rem)]">
      <div className="absolute inset-0">
        <Image src={img(IMAGES.ferns)} alt="" fill sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950 via-forest-950/70 to-forest-950" />
      </div>

      <div className="container-x relative">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <SectionLabel index="04">Plant finder</SectionLabel>
            <h2 className="mt-6 font-display text-[clamp(2.6rem,6vw,6rem)] leading-[0.92] tracking-[-0.03em]">
              Four questions.
              <br />
              <em className="text-lime">Your perfect match.</em>
            </h2>
          </div>

          <div className="mt-14 overflow-hidden rounded-[32px] border border-cream/10 bg-forest-900/70 backdrop-blur-2xl">
            {/* Progress */}
            <div className="flex items-center justify-between gap-6 border-b border-cream/10 px-6 py-5 md:px-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => (phase === "quiz" ? setStepIndex((i) => Math.max(0, i - 1)) : restart())}
                  disabled={phase === "quiz" && stepIndex === 0}
                  aria-label={phase === "quiz" ? "Previous question" : "Start over"}
                  className="grid size-10 place-items-center rounded-full border border-cream/15 transition-colors enabled:hover:bg-cream/10 disabled:opacity-30"
                >
                  {phase === "quiz" ? <ArrowLeft className="size-4" /> : <RotateCcw className="size-4" />}
                </button>
                <span className="eyebrow text-sage">
                  {phase === "quiz" ? `Question ${stepIndex + 1} of ${steps.length}` : "Your matches"}
                </span>
              </div>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-cream/10 md:w-64">
                <motion.div className="h-full rounded-full bg-lime" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.8, ease }} />
              </div>
            </div>

            <div className="min-h-[460px] px-6 py-10 md:px-10 md:py-14">
              <AnimatePresence mode="wait">
                {phase === "quiz" && (
                  <motion.div
                    key={`step-${stepIndex}`}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.6, ease }}
                  >
                    <h3 className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-tight">{step.question}</h3>
                    <div
                      className={cn(
                        "mt-10 grid gap-3",
                        step.options.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : step.options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
                      )}
                    >
                      {step.options.map((o, i) => {
                        const selected = answers[step.key] === o.value;
                        const Icon = o.icon;
                        return (
                          <motion.button
                            key={String(o.value)}
                            onClick={() => choose(o.value)}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease, delay: 0.1 + i * 0.06 }}
                            className={cn(
                              "group relative flex min-h-44 flex-col justify-between rounded-3xl border p-6 text-left transition-colors duration-500",
                              selected ? "border-lime bg-lime text-forest-950" : "border-cream/10 bg-cream/[0.03] hover:border-cream/30 hover:bg-cream/[0.07]",
                            )}
                          >
                            <span className="flex items-start justify-between">
                              <Icon className={cn("size-7 transition-transform duration-500 group-hover:scale-110", selected ? "text-forest-950" : "text-lime")} strokeWidth={1.4} />
                              <span
                                className={cn(
                                  "grid size-6 place-items-center rounded-full border transition-colors",
                                  selected ? "border-forest-950 bg-forest-950 text-lime" : "border-cream/25",
                                )}
                              >
                                {selected && <Check className="size-3.5" />}
                              </span>
                            </span>
                            <span>
                              <span className="block font-display text-2xl leading-tight">{o.label}</span>
                              <span className={cn("mt-1 block text-sm", selected ? "text-forest-950/70" : "text-cream/55")}>{o.hint}</span>
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {phase === "thinking" && (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[380px] flex-col items-center justify-center text-center"
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}>
                      <Sprout className="size-12 text-lime" strokeWidth={1.2} />
                    </motion.div>
                    <p className="mt-6 font-display text-3xl">Walking the nursery rows…</p>
                    <p className="mt-2 text-sm text-sage">Matching your space against 1,200+ varieties</p>
                  </motion.div>
                )}

                {phase === "results" && <Results key="results" matches={matches} onRestart={restart} />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Results({ matches, onRestart }: { matches: Match[]; onRestart: () => void }) {
  const { add } = useCart();

  if (matches.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[380px] flex-col items-center justify-center text-center">
        <Unlink className="size-10 text-lime" />
        <p className="mt-4 font-display text-3xl">No perfect match — yet.</p>
        <p className="mt-2 text-sage">Our plant doctors can suggest something on WhatsApp.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h3 className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-tight">
          We think you&rsquo;ll <em className="text-lime">love these.</em>
        </h3>
        <button onClick={onRestart} className="flex items-center gap-2 text-sm font-semibold text-sage transition-colors hover:text-cream">
          <RotateCcw className="size-4" /> Retake the quiz
        </button>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {matches.map(({ product, score, reasons }, i) => (
          <motion.article
            key={product.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: i * 0.12 }}
            className={cn("group overflow-hidden rounded-3xl bg-bone text-forest-950", i === 0 && "md:-translate-y-4")}
          >
            <div className="relative aspect-[5/4] overflow-hidden">
              <Image src={img(product.image)} alt={product.name} fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full bg-forest-950 px-3 py-1.5 text-xs font-bold text-lime">{score}% match</span>
              {i === 0 && <span className="absolute right-3 top-3 rounded-full bg-lime px-3 py-1.5 text-xs font-bold">Top pick</span>}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/plants/${product.id}`} className="font-display text-2xl leading-tight hover:text-moss">
                    {product.name}
                  </Link>
                  <p className="text-xs italic text-forest-950/50">{product.botanical}</p>
                </div>
                <p className="font-semibold">{formatINR(product.price)}</p>
              </div>
              <ul className="mt-4 space-y-1.5">
                {reasons.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-forest-950/75">
                    <Check className="size-3.5 shrink-0 text-moss" /> {r}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => add(product)}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-950 text-sm font-semibold text-cream transition-colors hover:bg-forest-700"
              >
                <Plus className="size-4" /> Add to bag
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
