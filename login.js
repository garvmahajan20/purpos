import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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
// Returns the volunteer profile only if registration is COMPLETE (has profileId + name).
// A partial doc created by newlogin.js (no name/profileId) is treated as "not registered".
async function findCompleteUserProfile(user) {
  let q;

  if (user.email) {
    q = query(
      collection(db, "volunteers"),
      where("email", "==", user.email)
    );
  } else if (user.phoneNumber) {
    q = query(
      collection(db, "volunteers"),
      where("phone", "==", user.phoneNumber)
    );
  } else {
    return null;
  }

  const snap = await getDocs(q);

  if (!snap.empty) {
    const data = snap.docs[0].data();
    // Only consider the profile complete if the registration form was submitted
    // (i.e. profileId AND name are present — newlogin.js partial docs lack these)
    if (data.profileId && data.name) {
      return data;
    }
  }

  return null;
}
auth.languageCode = "en";
window.recaptchaVerifier = new RecaptchaVerifier(
  auth,
  'recaptcha',
  {
    size: 'invisible',
    callback: (response) => {
      console.log("reCAPTCHA solved");
    }
  }
);

const googleButton = document.getElementById("googlelogin");
googleButton.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log(result.user);
    const user = result.user;

    const profile = await findCompleteUserProfile(user);

    if (profile) {
      localStorage.setItem("profileId", profile.profileId);
      window.location.href = "home.html";
    } else {
      window.location.href = "registrationform.html";
    }
  } catch (error) {
    console.error(error);
    alert("Login failed");
  }
});
const numberButton = document.getElementById("phonelogin");
const phoneSection = document.getElementById("phonesection")
const otpSection = document.getElementById("otpsection")

numberButton.addEventListener("click", () => {
  phoneSection.style.display = "flex";
});
const sendOtpButton = document.getElementById("sendOtpButton");
sendOtpButton.addEventListener("click", async () => {
  const phoneNumber = document.getElementById("phoneNumber").value.trim();

  if (!phoneNumber) {
    alert("Please enter a phone number");
    return;
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    otpSection.style.display = "flex";
  } catch (error) {
    console.error(error);
    alert("Sending OTP failed: " + error.message);
  }
});
const verifyButton = document.getElementById("verifyotp");
verifyButton.addEventListener("click", async () => {
  const code = document.getElementById("otp").value.trim();

  if (!code) {
    alert("Please enter the OTP");
    return;
  }

  try {
    const result = await window.confirmationResult.confirm(code);
    const user = result.user;

    const profile = await findCompleteUserProfile(user);

    if (profile) {
      localStorage.setItem("profileId", profile.profileId);
      window.location.href = "home.html";
    } else {
      window.location.href = "registrationform.html";
    }
  } catch (error) {
    console.error(error);
    alert("Wrong OTP or verification failed");
  }
});