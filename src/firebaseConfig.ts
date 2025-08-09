// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Check if all required environment variables are present
const requiredEnvVars = [
  'VITE_APIKEY',
  'VITE_AUTHDOMAIN', 
  'VITE_PROJECTID',
  'VITE_STORAGEBUCKET',
  'VITE_MESSAGESENDERID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars);
  console.error('Please create a .env file with the following variables:');
  console.error(requiredEnvVars.map(varName => `${varName}=your-value-here`).join('\n'));
  throw new Error(`Missing Firebase configuration: ${missingVars.join(', ')}`);
}

// Warn about missing App ID but don't fail
if (!import.meta.env.VITE_APPID || import.meta.env.VITE_APPID.includes('your-app-id-here')) {
  console.warn('VITE_APPID is missing or placeholder. Please add your Firebase App ID to .env file.');
  console.warn('You can find this in Firebase Console > Project Settings > Your apps');
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGESENDERID,
  appId: import.meta.env.VITE_APPID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;