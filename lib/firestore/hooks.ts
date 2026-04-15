"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { useFirebase } from "@/lib/firebase/client-context";
import { NutriFlowClient } from "@/lib/api/nutriflow";

function isRoutineTemplatesPath(path?: string | null): boolean {
  if (!path) return false;
  return /users\/[^/]+\/routineTemplates$/.test(path);
}

function sortData<T extends Record<string, unknown>>(
  data: T[],
  order?: { by: string; dir?: "asc" | "desc"; limit?: number },
): T[] {
  if (!order?.by) {
    return order?.limit ? data.slice(0, order.limit) : data;
  }

  const sorted = [...data].sort((a, b) => {
    const left = a[order.by];
    const right = b[order.by];

    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;

    if (typeof left === "number" && typeof right === "number") {
      return left - right;
    }

    return String(left).localeCompare(String(right));
  });

  if (order.dir === "desc") {
    sorted.reverse();
  }

  return order.limit ? sorted.slice(0, order.limit) : sorted;
}

export function useCol<T>(path?: string | null, order?: { by: string; dir?: "asc" | "desc"; limit?: number }) {
  const { db, auth } = useFirebase();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const orderField = order?.by;
  const orderDirection = order?.dir ?? "asc";
  const limitCount = order?.limit;
  const sortOrder = useMemo(
    () => ({ by: orderField ?? "", dir: orderDirection, limit: limitCount }),
    [orderField, orderDirection, limitCount],
  );

  const constraints = useMemo(() => {
    const c = [];
    if (orderField) c.push(orderBy(orderField, orderDirection));
    if (limitCount) c.push(limit(limitCount));
    return c;
  }, [orderField, orderDirection, limitCount]);

  useEffect(() => {
    if (!path) {
      setData([]);
      setLoading(false);
      return undefined;
    }

    if (isRoutineTemplatesPath(path)) {
      let cancelled = false;
      const run = async () => {
        if (!auth?.currentUser) {
          setData([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const routines = await NutriFlowClient.listRoutineTemplates();
          if (!cancelled) {
            setData(sortData(routines as unknown as Record<string, unknown>[], sortOrder) as T[]);
          }
        } catch (error) {
          console.error("Failed to load routines from NutriFlow", error);
          if (!cancelled) {
            setData([]);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      run();
      return () => {
        cancelled = true;
      };
    }

    if (!db) {
      setData([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const base = collection(db, path);
    const q = constraints.length > 0 ? query(base, ...constraints) : base;

    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ ...d.data(), id: d.id })) as T[]);
      setLoading(false);
    });

    return () => unsub();
  }, [path, constraints, db, auth, sortOrder]);

  return { data, loading };
}

export function useDoc<T>(path?: string | null) {
  const { db } = useFirebase();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path || !db) {
      setData(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const ref = doc(db, path);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setData({ ...snap.data(), id: snap.id } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [path, db]);

  return { data, loading };
}

