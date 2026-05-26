"use client";

import { createContext, useContext, type ReactNode } from "react";

const ErpSearchPendingContext = createContext(false);

export function ErpSearchPendingProvider({
  pending,
  children,
}: {
  pending: boolean;
  children: ReactNode;
}) {
  return (
    <ErpSearchPendingContext.Provider value={pending}>
      {children}
    </ErpSearchPendingContext.Provider>
  );
}

export function useErpSearchPending(): boolean {
  return useContext(ErpSearchPendingContext);
}
