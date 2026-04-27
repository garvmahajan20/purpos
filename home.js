import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
    apiKey: "AIzaSyBEGiOQ50aX8ndIZlY8DmygrzalFa3YCJQ",
    authDomain: "ngo-project-2eaec.firebaseapp.com",
    projectId: "ngo-project-2eaec",
    storageBucket: "ngo-project-2eaec.firebasestorage.app",
    messagingSenderId: "554387372544",
    appId: "1:554387372544:web:942b16e417d398fe68b6e5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= FRIEND DB ================= */

const friendConfig = {
    apiKey: "AIzaSyD1rUwjbtP-ysyl-zrABom85DCXFZdYoY8",
    authDomain: "urpos-fb090.firebaseapp.com",
    projectId: "urpos-fb090",
};

const friendApp = initializeApp(friendConfig, "friendApp");
const friendDB = getFirestore(friendApp);

/* ================= API ================= */

const API_URL = "https://ngo-backend-1at7.onrender.com/api/match-volunteers";

/* ================= DOM ================= */

const profileId = localStorage.getItem("profileId");
const profileIcon = document.getElementById("profileIcon");
const sidebar = document.getElementById("sidebar");
const saveNameBtn = document.getElementById("saveNameBtn");
const matchesGrid = document.getElementById("matchesGrid");
const allNgoBtn = document.getElementById("allngolist");
const browseProblemsBtn = document.getElementById("browseProblemsBtn");

// Popup refs
const popup = document.getElementById("problemPopup");
const closePopupBtn = document.getElementById("closeProblemPopup");
const popupNgo = document.getElementById("popupNgo");
const popupTitle = document.getElementById("popupTitle");
const popupDesc = document.getElementById("popupDesc");

let currentUser = null;
let volunteerDataGlobal = null; // 🔥 store full volunteer data

/* ================= AUTH ================= */

onAuthStateChanged(auth, async (user) => {
    console.log("🔵 AUTH STATE:", user);

    if (!user || !profileId) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    const docRef = doc(db, "volunteers", profileId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        window.location.href = "login.html";
        return;
    }

    const data = docSnap.data();
    console.log("👤 Volunteer Data:", data);

    volunteerDataGlobal = data; // 🔥 store globally

    // Sidebar fill
    document.getElementById("nameField").value = data.name || "";
    document.getElementById("emailField").value = data.email || "";
    document.getElementById("phoneField").value = data.phone || "";
    document.getElementById("sectorField").value = data.sector || "";
    document.getElementById("stateField").value = data.state || "";
    document.getElementById("cityField").value = data.city || "";
    document.getElementById("localityField").value = data.locality || "";
    document.getElementById("pincodeField").value = data.pincode || "";
    document.getElementById("travelField").value = data.travellingRange || "";
    document.getElementById("addressField").value = data.address || "";

    if (data.photo) profileIcon.src = data.photo;

    await sendDataToAPI(data);
});

/* ================= FETCH POSTS ================= */

async function fetchPosts() {
    const snapshot = await getDocs(collection(friendDB, "posts"));
    const posts = [];

    snapshot.forEach(docSnap => {
        const p = docSnap.data();

        posts.push({
            post_id: p.time,
            ngo_id: p.NGOid,
            title: p.title || "",
            description: p.body || "",
            city: p.city || "",
            state: p.state || ""
        });
    });

    return posts;
}

/* ================= SEND TO API ================= */

async function sendDataToAPI(volunteerData) {
    try {
        const volunteersPayload = [{
            uid: volunteerData.profileId,
            city: volunteerData.city || "",
            state: volunteerData.state || "",
            sector: volunteerData.sector || ""
        }];

        const postsPayload = await fetchPosts();

        const volunteersFile = new File([JSON.stringify(volunteersPayload)], "volunteers.json");
        const postsFile = new File([JSON.stringify(postsPayload)], "posts.json");

        const formData = new FormData();
        formData.append("volunteers_file", volunteersFile);
        formData.append("posts_file", postsFile);

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Backend error:", result);
            return;
        }

        console.log("✅ MATCHES RECEIVED:", result);
        processMatches(result);

    } catch (error) {
        console.error("💥 API FAILED:", error);
    }
}
/* ================= EMAIL FUNCTION ================= */
async function sendEmailNotification(problem) {
    try {
        console.log("📧 Sending email for:", problem);

        const res = await fetch("https://purpos-email-api.onrender.com/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: volunteerDataGlobal.email,
                name: volunteerDataGlobal.name,
                ngoName: problem.ngoName,
                title: problem.title
            })
        });

        const data = await res.json();
        console.log("📧 EMAIL RESPONSE:", data);

    } catch (err) {
        console.error("❌ EMAIL ERROR:", err);
    }
}

/* ================= PROCESS MATCHES ================= */

async function processMatches(apiData) {
    const results = [];

    for (const post of apiData) {
        const match = post.matched_volunteers?.find(v => v.uid === profileId);
        if (!match) continue;

        const ngoRef = doc(friendDB, "users", post.ngo_id);
        const ngoSnap = await getDoc(ngoRef);

        let ngoName = "Unknown NGO";
        let sector = "Unknown";

        if (ngoSnap.exists()) {
            const ngoData = ngoSnap.data();
            ngoName = ngoData.name;
            sector = ngoData.sector;
        }

        const postsQ = query(
            collection(friendDB, "posts"),
            where("NGOid", "==", post.ngo_id)
        );

        const postsSnap = await getDocs(postsQ);

        let title = "No Title";
        let body = "No Description";

        if (!postsSnap.empty) {
            const postData = postsSnap.docs[0].data();
            title = postData.title;
            body = postData.body;
        }

        results.push({
            ngoName,
            sector,
            title,
            body,
            critical: Boolean(post.critical),
            ngo_id: post.ngo_id,
            post_id: post.post_id
        });
    }
    if(results.length>0){
        sendEmailNotification(results[0]);
    }
    renderProblems(results);
}

/* ================= APPLY LOGIC ================= */

async function handleApplyClick(problem, button) {
    try {
        console.log("🟢 APPLY CLICKED:", problem);

        const q = query(
            collection(db, "addressedproblems"),
            where("uid", "==", profileId),
            where("post_id", "==", problem.post_id)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            alert("You have already applied for this NGO.");
            return;
        }

        await addDoc(collection(db, "addressedproblems"), {
            uid: profileId,
            ngo_id: problem.ngo_id,
            post_id: problem.post_id,

            name: volunteerDataGlobal.name || "",
            email: volunteerDataGlobal.email || "",
            phone: volunteerDataGlobal.phone || "",
            locality: volunteerDataGlobal.locality || "",
            pincode: volunteerDataGlobal.pincode || "",
            sector: volunteerDataGlobal.sector || "",
            state: volunteerDataGlobal.state || "",
            city: volunteerDataGlobal.city || "",
            travellingRange: volunteerDataGlobal.travellingRange || "",
            address: volunteerDataGlobal.address || "",

            appliedAt: serverTimestamp()
        });

        alert("Thank you for volunteering. The NGO has been notified and will reach out to you shortly.");

        button.textContent = "Applied";
        button.disabled = true;

    } catch (error) {
        console.error("❌ APPLY ERROR:", error);
    }
}

/* ================= RENDER ================= */

function renderProblems(problems) {

    matchesGrid.innerHTML = "";

    if (problems.length === 0) {
        matchesGrid.innerHTML = "<p>No Matches Found</p>";
        return;
    }

    problems.forEach(problem => {

        const card = document.createElement("div");
        card.classList.add("problem-card");
        if (problem.critical) card.classList.add("critical");

        card.innerHTML = `
            <h3 class="ngo-name">${problem.ngoName} ${problem.critical ? "⚠️" : ""}</h3>
            <p>${problem.sector}</p>
            <p class="problem-title">${problem.title}</p>

            <div class="card-buttons">
                <button class="apply-btn">Apply</button>
                <button class="more-btn">More Info</button>
            </div>
        `;

        // Apply button
        const applyBtn = card.querySelector(".apply-btn");
        applyBtn.addEventListener("click", () => {
            handleApplyClick(problem, applyBtn);
        });

        // Popup
        card.querySelector(".more-btn").addEventListener("click", () => {
            popupNgo.textContent = problem.ngoName;
            popupTitle.textContent = problem.title;
            popupDesc.textContent = problem.body;
            popup.classList.remove("hidden");
        });

        matchesGrid.appendChild(card);
    });
}

/* ================= POPUP ================= */

closePopupBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
});

popup.addEventListener("click", (e) => {
    if (e.target === popup) {
        popup.classList.add("hidden");
    }
});

/* ================= UI EVENTS ================= */

const sidebarBackdrop = document.getElementById("sidebarBackdrop");

function openSidebar() {
    sidebar.classList.add("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
}
function closeSidebar() {
    sidebar.classList.remove("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
}

// Profile icon: toggle sidebar on ALL screen sizes
profileIcon.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
});

// Tap backdrop to close sidebar
if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", closeSidebar);
}

// Desktop nav buttons
allNgoBtn.addEventListener("click", () => { window.location.href = "allngo.html"; });
browseProblemsBtn.addEventListener("click", () => { window.location.href = "allproblems.html"; });

// Mobile nav action bar buttons
const mobileAllNgo = document.getElementById("mobileAllNgo");
const mobileBrowseBtn = document.getElementById("mobileBrowseBtn");
if (mobileAllNgo) mobileAllNgo.addEventListener("click", () => { window.location.href = "allngo.html"; });
if (mobileBrowseBtn) mobileBrowseBtn.addEventListener("click", () => { window.location.href = "allproblems.html"; });

setInterval(() => {
    fetch("https://ngo-backend-1at7.onrender.com/").catch(() => { });
}, 50000);
