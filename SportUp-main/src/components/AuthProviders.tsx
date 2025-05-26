
"use client";

import { AuthProvider as ContextProvider } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <ContextProvider>{children}</ContextProvider>;
}
