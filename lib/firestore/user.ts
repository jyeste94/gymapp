import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
    type Firestore
} from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import type { User } from "firebase/auth";

/**
 * Obtiene el perfil de usuario de Firestore.
 */
export async function getUserProfile(db: Firestore, uid: string): Promise<UserProfile | null> {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * Crea o actualiza el perfil del usuario utilizando los datos de Auth si no existe.
 */
export async function ensureUserProfile(db: Firestore, user: User) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            // Social defaults
            username: null,
            bio: null,
            isPrivate: false,
        };
        await setDoc(ref, newProfile);
        return newProfile;
    }
    return snap.data() as UserProfile;
}

/**
 * Actualiza parcialmente el perfil del usuario.
 */
export async function updateUserProfile(db: Firestore, uid: string, data: Partial<UserProfile>) {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, data);
}

/**
 * Comprueba si un nombre de usuario ya está cogido.
 * Retorna true si está disponible, false si ya existe.
 */
export async function checkUsernameAvailability(db: Firestore, username: string, currentUid?: string): Promise<boolean> {
    // Normalizamos a minusculas para evitar duplicados como "User" y "user"
    // const normalized = username.toLowerCase();

    // NOTA: Esto requeriría que guardes el username en minusculas tambien o indices especificos.
    // Por ahora haremos una query simple. Para produccion seria mejor usar un campo 'usernameLower'.

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const snap = await getDocs(q);

    if (snap.empty) return true;

    // Si encontramos alguno, verificamos si es el mismo usuario (por si está editando su propio perfil)
    if (currentUid && snap.docs.length === 1 && snap.docs[0].id === currentUid) {
        return true;
    }

    return false;
}
