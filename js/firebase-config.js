// ============================================================
// FIREBASE CONFIG — fill this in with YOUR Firebase project keys
// ============================================================
// You get these values from: Firebase Console > Project Settings
// > General tab > "Your apps" > Web app > SDK setup and configuration
//
// See SETUP.md in this folder for the full step-by-step walkthrough.
// ============================================================

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Initialize Firebase (using the compat SDK loaded via <script> tags in HTML)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Internal domain used to turn usernames into fake emails Firebase Auth needs.
// Users never see this — they only ever type a username.
const FAKE_EMAIL_DOMAIN = "nekko.local";
