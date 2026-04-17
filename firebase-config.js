/* ════════════════════════════════════════════════════
   firebase-config.js  —  Zia Cakes
   ════════════════════════════════════════════════════ */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore }  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage }    from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

const firebaseConfig = {
  apiKey:            "AIzaSyCFnrDVtZyxyRWa-87A-4UrTfpkYfQ4Rrc",
  authDomain:        "zia-cakes.firebaseapp.com",
  projectId:         "zia-cakes",
  storageBucket:     "zia-cakes.firebasestorage.app",
  messagingSenderId: "952561060595",
  appId:             "1:952561060595:web:f6a6c2386fd8c29293c586",
  measurementId:     "G-6NHJ5WENGM"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const storage = getStorage(app);
