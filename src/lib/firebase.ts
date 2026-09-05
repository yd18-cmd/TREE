import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  increment,
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import type { StudentProfile, ClimateCertification } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');

const COLLECTION_NAME = 'climate_students';

// Local storage fallback key
const LOCAL_STORAGE_KEY_PREFIX = 'climate_student_data_';

/**
 * Normalizes management code (trims and converts to uppercase for consistency)
 */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Loads a student profile by management code from Firestore, with LocalStorage fallback
 */
export async function loadStudentProfile(rawCode: string): Promise<StudentProfile | null> {
  const code = normalizeCode(rawCode);
  if (!code) return null;

  try {
    const docRef = doc(db, COLLECTION_NAME, code);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as StudentProfile;
      // Backup to local storage
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + code, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.warn('Firestore load failed, checking local backup:', error);
  }

  // Fallback to local storage if offline
  const localBackup = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + code);
  if (localBackup) {
    try {
      return JSON.parse(localBackup) as StudentProfile;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Saves/Updates student profile in Firestore and LocalStorage
 */
export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  const code = normalizeCode(profile.manageCode);
  if (!code) return;

  const dataToSave: StudentProfile = {
    ...profile,
    manageCode: code,
    lastPlayedAt: new Date().toISOString(),
  };

  // Immediate local backup
  localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + code, JSON.stringify(dataToSave));

  try {
    const docRef = doc(db, COLLECTION_NAME, code);
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    console.error('Failed to sync student data to Firestore:', error);
  }
}

/**
 * Subscribes to real-time updates for a student profile
 */
export function subscribeStudentProfile(
  rawCode: string, 
  onUpdate: (profile: StudentProfile) => void
): Unsubscribe {
  const code = normalizeCode(rawCode);
  const docRef = doc(db, COLLECTION_NAME, code);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as StudentProfile;
      onUpdate(data);
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + code, JSON.stringify(data));
    }
  }, (error) => {
    console.warn('Firestore subscription error:', error);
  });
}

const CERTS_COLLECTION = 'climate_certifications';

/**
 * Saves a new climate action certification to Firestore
 */
export async function saveCertification(cert: Omit<ClimateCertification, 'id'>): Promise<string> {
  const collectionRef = collection(db, CERTS_COLLECTION);
  const docRef = await addDoc(collectionRef, {
    ...cert,
    createdAt: new Date().toISOString(),
    likes: cert.likes || 0,
  });
  return docRef.id;
}

/**
 * Subscribes to real-time climate action certifications
 */
export function subscribeCertifications(
  onUpdate: (certs: ClimateCertification[]) => void
): Unsubscribe {
  const collectionRef = collection(db, CERTS_COLLECTION);
  const q = query(collectionRef, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(q, (querySnapshot) => {
    const list: ClimateCertification[] = [];
    querySnapshot.forEach((d) => {
      list.push({
        id: d.id,
        ...(d.data() as Omit<ClimateCertification, 'id'>),
      });
    });
    onUpdate(list);
  }, (error) => {
    console.warn('Firestore certifications subscription error:', error);
  });
}

/**
 * Adds an encouragement like to a certification
 */
export async function likeCertification(certId: string): Promise<void> {
  try {
    const certDoc = doc(db, CERTS_COLLECTION, certId);
    await updateDoc(certDoc, {
      likes: increment(1)
    });
  } catch (err) {
    console.error('Failed to like certification:', err);
  }
}

