import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBEGiOQ50aX8ndIZlY8DmygrzalFa3YCJQ",
  authDomain: "ngo-project-2eaec.firebaseapp.com",
  projectId: "ngo-project-2eaec",
  storageBucket: "ngo-project-2eaec.firebasestorage.app",
  messagingSenderId: "554387372544",
  appId: "1:554387372544:web:942b16e417d398fe68b6e5",
  measurementId: "G-XVJ78DHX61"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const googleButton = document.getElementById("googlelogin");

  googleButton.addEventListener("click", async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User signed in:", user);

      // Check if this user already completed registration
      const q = query(collection(db, "volunteers"), where("uid", "==", user.uid));
      const snap = await getDocs(q);

      if (!snap.empty && snap.docs[0].data().profileId && snap.docs[0].data().name) {
        // Already registered — go to home
        const profile = snap.docs[0].data();
        localStorage.setItem("profileId", profile.profileId);
        window.location.href = "home.html";
        return;
      }

      // Save a placeholder doc so registrationform.js can find the authenticated user
      // Use uid as document ID for consistency with registrationform.js lookup
      await setDoc(doc(db, "volunteers", user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        photo: user.photoURL || "",
      }, { merge: true });

      console.log("Placeholder doc saved — redirecting to registration");
      window.location.href = "registrationform.html";
    } catch (error) {
      console.error(error);
      alert("Sign in failed: " + error.message);
    }
  });
});
