"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Intro = { done: boolean; finish: () => void };

const IntroContext = createContext<Intro>({ done: true, finish: () => {} });

export const useIntro = () => useContext(IntroContext);

/** Lets the hero wait for the preloader curtain before playing its entrance. */
export function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  return <IntroContext.Provider value={{ done, finish: () => setDone(true) }}>{children}</IntroContext.Provider>;
}
