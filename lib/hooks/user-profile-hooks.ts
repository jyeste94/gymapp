import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types";

export function useUserProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        if (!user?.uid) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setProfile(snap.data() as UserProfile);
            } else {
                // Create default profile if not exists
                const newProfile: UserProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: new Date().toISOString(),
                };
                await setDoc(ref, newProfile);
                setProfile(newProfile);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user?.uid) return;
        try {
            const ref = doc(db, "users", user.uid);
            await updateDoc(ref, data);
            setProfile((prev) => (prev ? { ...prev, ...data } : null));
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    return { profile, loading, updateProfile, refreshProfile: fetchProfile };
}
