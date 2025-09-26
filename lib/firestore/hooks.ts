"use client";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export function useCol<T>(path?: string | null, order?: { by: string; dir?: "asc" | "desc" }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const orderField = order?.by;
  const orderDirection = order?.dir ?? "asc";
  const orderConstraint = useMemo(
    () => (orderField ? orderBy(orderField, orderDirection) : null),
    [orderField, orderDirection],
  );

  useEffect(() => {
    if (!path) {
      setData([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const base = collection(db, path);
    const q = orderConstraint ? query(base, orderConstraint) : base;

    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[]);
      setLoading(false);
    });

    return () => unsub();
  }, [path, orderConstraint]);

  return { data, loading };
}
