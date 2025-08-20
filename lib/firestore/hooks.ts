"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function useCol<T>(path: string, order?: { by: string; dir?: "asc"|"desc" }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = collection(db, path);
    const q = order ? query(c, orderBy(order.by, order.dir ?? "asc")) : c;
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })) as T[]);
      setLoading(false);
    });
    return () => unsub();
  }, [path, order?.by, order?.dir]);
  return { data, loading };
}
