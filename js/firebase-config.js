// ============================================================
// FIREBASE CONFIG — fill this in with YOUR Firebase project keys
// ============================================================
// You get these values from: Firebase Console > Project Settings
// > General tab > "Your apps" > Web app > SDK setup and configuration
//
// See SETUP.md in this folder for the full step-by-step walkthrough.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyC3Bd8o7Kekey70acV_6bIslq9Cb3eggu8",
  authDomain: "nekko-5694a.firebaseapp.com",
  projectId: "nekko-5694a",
  storageBucket: "nekko-5694a.firebasestorage.app",
  messagingSenderId: "254996957921",
  appId: "1:254996957921:web:e370d36c750e895aed85a0"
};

// Initialize Firebase (using the compat SDK loaded via <script> tags in HTML)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Internal domain used to turn usernames into fake emails Firebase Auth needs.
// Users never see this — they only ever type a username.
const FAKE_EMAIL_DOMAIN = "nekko.local";
