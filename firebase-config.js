/* ════════════════════════════════════════════════════
   firebase-config.js  —  Zia Cakes
   ────────────────────────────────────────────────────
   HOW TO SET UP (takes 3 minutes):

   1. Go to https://console.firebase.google.com
   2. Click "Add project" → name it "zia-cakes" → Create
   3. On project home, click "</>" (Web app) → Register app
   4. Copy the firebaseConfig object below and REPLACE
      the placeholder values with your actual values
   5. In Firebase console:
      • Firestore Database → Create database → Start in test mode
      • Storage → Get started → Start in test mode
   ════════════════════════════════════════════════════ */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore }  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage }    from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
import { getAuth }       from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// ✏️  REPLACE these values with your Firebase project config
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const storage = getStorage(app);
export const auth    = getAuth(app);
