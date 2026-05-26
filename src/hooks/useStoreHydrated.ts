"use client";

import { useEffect, useState } from "react";

/** รอ hydrate ค่า persist จาก localStorage ก่อนใช้ store */
export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
