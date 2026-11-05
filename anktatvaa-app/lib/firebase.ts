import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Firestore 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  FirebaseStorage 
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "anktatvaa-dev.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "anktatvaa-dev",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "anktatvaa-dev.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

// Check if credentials are valid/configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "AIzaSyDummyKeyForDevelopment" &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "anktatvaa-dev"
  );
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (typeof window !== 'undefined') {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn("Firebase initialization warning (running in graceful local mode):", err);
  }
}

export { app, auth, db, storage };
export const googleProvider = new GoogleAuthProvider();

export interface SeekerReading {
  id: string;
  userId?: string;
  type: string;
  title: string;
  summary: string;
  link: string;
  date: string;
  timestamp: number;
  reportUrl?: string; // Firebase Storage URL for exported reports or attachments
}

// ── Firebase Cloud Storage Helper: Upload reading report / document / avatar ──
export async function uploadSeekerFile(
  userId: string, 
  file: Blob | File, 
  folder: 'avatars' | 'reports' | 'charts' = 'reports',
  customFileName?: string
): Promise<string> {
  const fileName = customFileName || `${Date.now()}_${file instanceof File ? file.name : 'reading.pdf'}`;
  
  if (isFirebaseConfigured() && storage) {
    try {
      const fileRef = ref(storage, `seekers/${userId}/${folder}/${fileName}`);
      const uploadResult = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    } catch (e) {
      console.error("Firebase Storage upload error, falling back to local object URL:", e);
    }
  }

  // Fallback to local Data URL / Object URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem(`ank_file_${fileName}`, dataUrl.substring(0, 100000));
      } catch (err) {}
      resolve(dataUrl);
    };
    reader.readAsDataURL(file);
  });
}

// ── Firestore / Local Reading Persistence ──
export async function saveReading(reading: Omit<SeekerReading, 'id' | 'timestamp' | 'date'>): Promise<SeekerReading> {
  const newReading: SeekerReading = {
    ...reading,
    id: `rd_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timestamp: Date.now()
  };

  // 1. Sync to localStorage
  try {
    const list: SeekerReading[] = JSON.parse(localStorage.getItem('ank_saved_readings') || '[]');
    list.unshift(newReading);
    localStorage.setItem('ank_saved_readings', JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error("LocalStorage save error:", e);
  }

  // 2. Sync to Firestore if authenticated & configured
  if (isFirebaseConfigured() && db && reading.userId) {
    try {
      await setDoc(doc(db, 'readings', newReading.id), newReading);
    } catch (e) {
      console.warn("Firestore save warning (persisted locally):", e);
    }
  }

  return newReading;
}

export async function fetchUserReadings(userId?: string): Promise<SeekerReading[]> {
  // If Firestore is available and user is authenticated, query Cloud Firestore
  if (isFirebaseConfigured() && db && userId) {
    try {
      const q = query(
        collection(db, 'readings'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => d.data() as SeekerReading);
      if (docs.length > 0) return docs;
    } catch (e) {
      console.warn("Firestore fetch error, falling back to local cache:", e);
    }
  }

  // Return localStorage cached readings
  try {
    const local = localStorage.getItem('ank_saved_readings');
    return local ? JSON.parse(local) : [];
  } catch (e) {
    return [];
  }
}

export async function removeReading(readingId: string): Promise<void> {
  // 1. Remove from localStorage
  try {
    let list: SeekerReading[] = JSON.parse(localStorage.getItem('ank_saved_readings') || '[]');
    list = list.filter(r => r.id !== readingId);
    localStorage.setItem('ank_saved_readings', JSON.stringify(list));
  } catch (e) {}

  // 2. Remove from Firestore
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'readings', readingId));
    } catch (e) {}
  }
}
