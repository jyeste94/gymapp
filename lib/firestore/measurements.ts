import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { Measurement } from "@/lib/types";
import { useState, useEffect } from "react";

// Hook para obtener mediciones en tiempo real
export const useMeasurements = (db: Firestore | null, userId: string | null) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId) {
      setMeasurements([]);
      setLoading(false);
      return;
    }

    const measurementsCol = collection(db, `users/${userId}/measurements`);
    const q = query(measurementsCol, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Measurement));
      setMeasurements(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, userId]);

  return { data: measurements, loading };
};


// Funcion para obtener todas las mediciones de un usuario (una sola vez)
export const getMeasurements = async (db: Firestore, userId: string): Promise<Measurement[]> => {
  const measurementsCol = collection(db, `users/${userId}/measurements`);
  const q = query(measurementsCol, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Measurement));
};

// Funcion para añadir una nueva medicion
export const addMeasurement = async (db: Firestore, userId: string, data: Omit<Measurement, "id">) => {
  const measurementsCol = collection(db, `users/${userId}/measurements`);
  const docRef = await addDoc(measurementsCol, data);
  return docRef.id;
};

// Funcion para actualizar una medicion existente
export const updateMeasurement = async (db: Firestore, userId: string, measurementId: string, data: Partial<Omit<Measurement, "id">>) => {
  const measurementDoc = doc(db, `users/${userId}/measurements`, measurementId);
  await updateDoc(measurementDoc, data);
};

// Funcion para eliminar una medicion
export const deleteMeasurement = async (db: Firestore, userId: string, measurementId: string) => {
  const measurementDoc = doc(db, `users/${userId}/measurements`, measurementId);
  await deleteDoc(measurementDoc);
};
