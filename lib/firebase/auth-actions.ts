
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { FirebaseApp } from "firebase/app";

// It's safe to call this multiple times, Firebase internally ensures singletons.
const getProviders = (app: FirebaseApp) => {
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  facebookProvider.setCustomParameters({ display: "popup" });
  const twitterProvider = new TwitterAuthProvider();
  const appleProvider = new OAuthProvider("apple.com");
  appleProvider.addScope("email");
  appleProvider.addScope("name");

  return { auth, googleProvider, facebookProvider, twitterProvider, appleProvider };
};

export const loginEmail = async (app: FirebaseApp, email: string, pass: string) => {
  const { auth } = getProviders(app);
  return signInWithEmailAndPassword(auth, email, pass);
};

export const signupEmail = async (app: FirebaseApp, email: string, pass: string) => {
  const { auth } = getProviders(app);
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const loginGoogle = async (app: FirebaseApp) => {
  const { auth, googleProvider } = getProviders(app);
  return signInWithPopup(auth, googleProvider);
};

export const loginFacebook = async (app: FirebaseApp) => {
  const { auth, facebookProvider } = getProviders(app);
  return signInWithPopup(auth, facebookProvider);
};

export const loginTwitter = async (app: FirebaseApp) => {
  const { auth, twitterProvider } = getProviders(app);
  return signInWithPopup(auth, twitterProvider);
};

export const loginApple = async (app: FirebaseApp) => {
  const { auth, appleProvider } = getProviders(app);
  return signInWithPopup(auth, appleProvider);
};

export const logout = async (app: FirebaseApp) => {
  const { auth } = getProviders(app);
  return signOut(auth);
};
