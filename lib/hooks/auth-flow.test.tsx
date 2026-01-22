import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUserProfile } from "./user-profile-hooks";

// --- MOCKS ---

// Mock Firebase Config
vi.mock("@/lib/firebase/config", () => ({
    db: {}, // Mock DB instance
}));

// Mock Auth Hook
const mockUser = {
    uid: "test-uid-123",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: null,
};

const useAuthMock = vi.fn();
vi.mock("@/lib/firebase/auth-hooks", () => ({
    useAuth: () => useAuthMock(),
}));

// Mock Firestore
const getDocMock = vi.fn();
const setDocMock = vi.fn();
vi.mock("firebase/firestore", () => ({
    doc: vi.fn(),
    getDoc: (...args: unknown[]) => getDocMock(...args),
    setDoc: (...args: unknown[]) => setDocMock(...args),
    updateDoc: vi.fn(),
}));

describe("Authentication & Profile Creation Flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should automatically create a UserProfile when a new user signs up (first login)", async () => {
        // 1. Simulate Auth State: User is logged in
        useAuthMock.mockReturnValue({ user: mockUser, loading: false });

        // 2. Simulate Firestore: Profile document DOES NOT exist yet (first time)
        getDocMock.mockResolvedValue({
            exists: () => false,
            data: () => undefined,
        });

        // 3. Render the hook
        const { result } = renderHook(() => useUserProfile());

        // 4. Assert initial loading state
        expect(result.current.loading).toBe(true);

        // 5. Wait for the profile creation logic to finish
        await waitFor(() => {
            // The hook should satisfy loading = false
            expect(result.current.loading).toBe(false);
        });

        // 6. VERIFY: Did it attempt to CREATE the document?
        expect(setDocMock).toHaveBeenCalledTimes(1);

        // Check arguments: The second arg should be the new profile object
        const createdProfile = setDocMock.mock.calls[0][1];
        expect(createdProfile).toEqual(expect.objectContaining({
            uid: mockUser.uid,
            email: mockUser.email,
            displayName: mockUser.displayName,
        }));

        // 7. VERIFY: The hook state should reflect the new profile
        expect(result.current.profile).toEqual(expect.objectContaining({
            uid: mockUser.uid,
            email: mockUser.email,
        }));
    });

    it("should load existing profile if user already exists", async () => {
        // 1. Simulate Auth State
        useAuthMock.mockReturnValue({ user: mockUser, loading: false });

        // 2. Simulate Firestore: Profile ALREADY exists
        const existingProfile = {
            uid: mockUser.uid,
            email: mockUser.email,
            weightKg: 75.5, // Existing data
        };

        getDocMock.mockResolvedValue({
            exists: () => true,
            data: () => existingProfile,
        });

        // 3. Render
        const { result } = renderHook(() => useUserProfile());

        // 4. Wait for load
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // 5. VERIFY: Should NOT create a new doc
        expect(setDocMock).not.toHaveBeenCalled();

        // 6. VERIFY: Hook should return existing data
        expect(result.current.profile).toEqual(existingProfile);
    });
});
