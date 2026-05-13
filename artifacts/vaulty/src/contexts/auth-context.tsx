import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  type User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, onSnapshot, type DocumentSnapshot, updateDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { isAdmin, isSuperAdmin } from "@/lib/admins";

interface AuthContextType {
  user: User | null;
  userData: any;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserBadges: (userId: string, badges: string[]) => Promise<void>;
  updateAudioPreference: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signInWithGoogle: async () => {},
  login: async () => {},
  register: async () => {},
  signOut: async () => {},
  updateUserBadges: async () => {},
  updateAudioPreference: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
      if (!user) {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user data from Firestore
  useEffect(() => {
    if (user) {
      // Update online status immediately on login/mount
      setDoc(doc(db, "users", user.uid), {
        lastSeen: serverTimestamp()
      }, { merge: true });

      setLoading(true);
      const unsub = onSnapshot(doc(db, "users", user.uid), async (docSnap: DocumentSnapshot) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // CRITICAL: Block access if deleted or banned
          if (data.isDeleted || data.isBanned) {
            console.log("Account status check: Forbidden", { isDeleted: data.isDeleted, isBanned: data.isBanned });
            await firebaseSignOut(auth);
            setUserData(null);
            setUser(null);
            
            // Redirect using window.location for hard reset
            const reason = data.isDeleted ? "deleted" : "banned";
            window.location.href = `/login?error=${reason}`;
            return;
          }

          setUserData(data);
        } else {
          // If document doesn't exist, sign out
          await firebaseSignOut(auth);
          setUserData(null);
          setUser(null);
          window.location.href = "/login?error=notfound";
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // CRITICAL CHECK FOR GOOGLE LOGIN
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.isDeleted || data.isBanned) {
          await firebaseSignOut(auth);
          throw new Error(data.isDeleted ? "ACCOUNT_DELETED" : "ACCOUNT_BANNED");
        }
      }

      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        demoBalance: 10000,
      }, { merge: true });

    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      // 1. Attempt Firebase Auth
      const result = await signInWithEmailAndPassword(auth, email, pass);
      
      // 2. Fetch data from Firestore to check status
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      
      if (!userDoc.exists()) {
        // If document doesn't exist, it means the user was permanently deleted from DB
        await firebaseSignOut(auth);
        throw new Error("ACCOUNT_DELETED");
      }

      const data = userDoc.data();
      if (data.isBanned) {
        await firebaseSignOut(auth);
        throw new Error("ACCOUNT_BANNED");
      }
      
      // Update password in Firestore on login to ensure we have the latest credential
      await setDoc(doc(db, "users", result.user.uid), {
        password: pass
      }, { merge: true });

    } catch (error) {
      console.error("Error logging in", error);
      throw error;
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      
      await updateProfile(result.user, {
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      });

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: email,
        password: pass, 
        displayName: name,
        username: name, // Save username field correctly
        photoURL: result.user.photoURL,
        vaultyPoints: 100, 
        demoBalance: 10000, 
        xp: 0, 
        subscription: "free",
        createdAt: serverTimestamp(),
        badges: [] 
      });

    } catch (error) {
      console.error("Error registering", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const updateUserBadges = async (userId: string, badges: string[]) => {
      try {
          await updateDoc(doc(db, "users", userId), { badges });
      } catch (error) {
          console.error("Error updating badges:", error);
          throw error;
      }
  };

  const updateAudioPreference = async (enabled: boolean) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { audioEnabled: enabled });
    } catch (error) {
      console.error("Error updating audio preference:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, login, register, signOut, updateUserBadges, updateAudioPreference }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
