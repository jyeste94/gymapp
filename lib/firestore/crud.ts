
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
  Firestore,
} from "firebase/firestore";
import type { DocumentData, WhereFilterOp } from "firebase/firestore";

type Filter = { field: string; op: WhereFilterOp; value: unknown };
type WithId<T extends DocumentData> = T & { id: string };

type WriteData = DocumentData;

const colRef = (db: Firestore, path: string) => collection(db, path);
const docRef = (db: Firestore, path: string) => doc(db, path);

export async function add<T extends WriteData>(db: Firestore, path: string, data: T) {
  const ref = await addDoc(colRef(db, path), data);
  return ref.id;
}

export async function put<T extends WriteData>(db: Firestore, path: string, id: string, data: Partial<T>) {
  await setDoc(docRef(db, `${path}/${id}`), data as DocumentData, { merge: true });
}

export async function getOne<T extends WriteData>(db: Firestore, path: string, id: string) {
  const snap = await getDoc(docRef(db, `${path}/${id}`));
  return snap.exists() ? (snap.data() as T) : null;
}

export async function getAll<T extends WriteData>(db: Firestore, path: string, filters: Filter[] = []) {
  const base = colRef(db, path);
  const constraints = filters.map((f) => where(f.field, f.op, f.value));
  const queryRef = constraints.length ? query(base, ...constraints) : base;
  const snap = await getDocs(queryRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WithId<T>);
}

export async function update<T extends WriteData>(db: Firestore, path: string, id: string, data: Partial<T>) {
  await updateDoc(docRef(db, `${path}/${id}`), data as DocumentData);
}

export async function remove(db: Firestore, path: string, id: string) {
  await deleteDoc(docRef(db, `${path}/${id}`));
}

export type { Filter as FirestoreFilter, WithId };
