import { db } from "@/lib/firebase/client";
import {
  collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, addDoc
} from "firebase/firestore";

export const colRef = (path: string) => collection(db, path);
export const docRef = (path: string) => doc(db, path);

export async function add<T>(path: string, data: T) {
  const c = colRef(path);
  const ref = await addDoc(c, data as any);
  return ref.id;
}

export async function put<T>(path: string, id: string, data: T) {
  await setDoc(docRef(`${path}/${id}`), data as any, { merge: true });
}

export async function getOne<T>(path: string, id: string) {
  const snap = await getDoc(docRef(`${path}/${id}`));
  return snap.exists() ? (snap.data() as T) : null;
}

export async function getAll<T>(path: string, filters?: { field: string; op: any; value: any }[]) {
  let q: any = colRef(path);
  if (filters?.length) {
    q = query(q, ...filters.map(f => where(f.field as any, f.op, f.value)));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as T[];
}

export async function update<T>(path: string, id: string, data: Partial<T>) {
  await updateDoc(docRef(`${path}/${id}`), data as any);
}

export async function remove(path: string, id: string) {
  await deleteDoc(docRef(`${path}/${id}`));
}
