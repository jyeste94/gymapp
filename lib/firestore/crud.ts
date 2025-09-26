import { db } from "@/lib/firebase/client";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { DocumentData, WhereFilterOp } from "firebase/firestore";

type Filter = { field: string; op: WhereFilterOp; value: unknown };
type WithId<T extends DocumentData> = T & { id: string };

type WriteData = DocumentData;

const colRef = (path: string) => collection(db, path);
const docRef = (path: string) => doc(db, path);

export async function add<T extends WriteData>(path: string, data: T) {
  const ref = await addDoc(colRef(path), data);
  return ref.id;
}

export async function put<T extends WriteData>(path: string, id: string, data: Partial<T>) {
  await setDoc(docRef(`${path}/${id}`), data as DocumentData, { merge: true });
}

export async function getOne<T extends WriteData>(path: string, id: string) {
  const snap = await getDoc(docRef(`${path}/${id}`));
  return snap.exists() ? (snap.data() as T) : null;
}

export async function getAll<T extends WriteData>(path: string, filters: Filter[] = []) {
  const base = colRef(path);
  const constraints = filters.map((f) => where(f.field, f.op, f.value));
  const queryRef = constraints.length ? query(base, ...constraints) : base;
  const snap = await getDocs(queryRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WithId<T>);
}

export async function update<T extends WriteData>(path: string, id: string, data: Partial<T>) {
  await updateDoc(docRef(`${path}/${id}`), data as DocumentData);
}

export async function remove(path: string, id: string) {
  await deleteDoc(docRef(`${path}/${id}`));
}

export type { Filter as FirestoreFilter, WithId };
