import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence
} from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyASaVr2-RcYAR_0proWO1vbuIUV2xzn3tg",
  authDomain: "ai-prompt-quality-evaluator.firebaseapp.com",
  projectId: "ai-prompt-quality-evaluator",
  storageBucket: "ai-prompt-quality-evaluator.firebasestorage.app",
  messagingSenderId: "707364573769",
  appId: "1:707364573769:web:fa6288b69210d139d52598"
};

// Initialize Firebase safely (avoid re-initialization if hot-reloaded)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Auth provider settings
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { browserLocalPersistence, browserSessionPersistence, setPersistence };
