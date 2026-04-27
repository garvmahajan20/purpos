import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { collection } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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
const db = getFirestore(app);
const auth = getAuth(app);
const user = auth.currentUser;
let currentUser = null;
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    console.log("User available:", user.uid);
  } else {
    console.log("No user");
  }
})
const addressInput = document.getElementById("address");

const autocomplete = new google.maps.places.Autocomplete(addressInput, {
  componentRestrictions: { country: "in" }
});

autocomplete.addListener("place_changed", () => {
  const place = autocomplete.getPlace();

  let city = "";
  let state = "";

  place.address_components.forEach(component => {
    const types = component.types;

    if (types.includes("locality")) {
      city = component.long_name;
    }

    if (types.includes("administrative_area_level_1")) {
      state = component.long_name;
    }
  });

  document.getElementById("city").value = city;
  document.getElementById("state").value = state;
});

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
nextBtn.addEventListener("click", () => {

  const step1Inputs = step1.querySelectorAll("input");

  for (let input of step1Inputs) {

    if (!input.checkValidity()) {
      input.reportValidity(); 
      console.log("❌ Invalid:", input.id);
      return; 
    }
  }


  step1.style.display = "none";
  step2.style.display = "block";
  document.getElementById("stepIndicator").textContent = "Step 2 of 2";
});
backBtn.addEventListener("click", () => {
  step2.style.display = "none";
  step1.style.display = "block";
  document.getElementById("stepIndicator").textContent = "Step 1 of 2";
});


const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phonenumber").value.trim();
  const address = document.getElementById("address").value.trim();
  const locality = document.getElementById("locality").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const sector = document.getElementById("sector").value.trim();

  const travellingRange = Number(document.getElementById("travellingrange").value);
  if (!city || !state) {
    alert("Please select a valid location from suggestions");
    return;
  }
  if (!sector) {
    alert("Please enter your sector");
    return;
  }
  if (!currentUser) {
    alert("User not logged in");
    return;
  }
  try {

    const q = query(collection(db, "volunteers"), where("uid", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);

    let profileRef;
    let profileId;

    if (!querySnapshot.empty) {
      const existingDoc = querySnapshot.docs[0];
      profileRef = doc(db, "volunteers", existingDoc.id);
      profileId = existingDoc.id;

    } else {
      profileRef = doc(collection(db, "volunteers"));
      profileId = profileRef.id;
    }

    await setDoc(profileRef, {
      profileId,
      uid: currentUser.uid,
      email: currentUser.email,
      photo: currentUser.photoURL,
      name,
      phone,
      state,
      city,
      address,
      sector,
      locality,
      pincode,
      travellingRange,
      createdAt: serverTimestamp()
    });

    localStorage.setItem("profileId", profileId);

    alert("Form submitted successfully!");
    form.reset();

    window.location.href = "home.html";

  } catch (error) {
    console.error("Error saving form data:", error);
    alert("Could not save form data.");
  }
});