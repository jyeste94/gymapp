
"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useFirebase } from "@/lib/firebase/client-context";

export function useCol<T>(path?: string | null, order?: { by: string; dir?: "asc" | "desc" }) {
  const { db } = useFirebase();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const orderField = order?.by;
  const orderDirection = order?.dir ?? "asc";
  const orderConstraint = useMemo(
    () => (orderField ? orderBy(orderField, orderDirection) : null),
    [orderField, orderDirection],
  );

  useEffect(() => {
    if (!path || !db) {
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
  }, [path, orderConstraint, db]);

  return { data, loading };
}
