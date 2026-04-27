import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";



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


const friendConfig = {
    apiKey: "AIzaSyD1rUwjbtP-ysyl-zrABom85DCXFZdYoY8",
    authDomain: "urpos-fb090.firebaseapp.com",
    projectId: "urpos-fb090",
};

const friendApp = initializeApp(friendConfig, "friendApp");
const friendDB = getFirestore(friendApp);



const profileId = localStorage.getItem("profileId");
const matchesGrid = document.getElementById("allProblemsGrid");

const popup = document.getElementById("problemPopup");
const closePopupBtn = document.getElementById("closeProblemPopup");
const popupNgo = document.getElementById("popupNgo");
const popupSector = document.getElementById("popupSector");
const popupTitle = document.getElementById("popupTitle");
const popupDesc = document.getElementById("popupDesc");

let volunteerDataGlobal = null;


onAuthStateChanged(auth, async (user) => {

    if (!user || !profileId) {
        window.location.href = "login.html";
        return;
    }

    const docRef = doc(db, "volunteers", profileId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        window.location.href = "login.html";
        return;
    }

    volunteerDataGlobal = docSnap.data();

    console.log("👤 Volunteer Loaded:", volunteerDataGlobal);

    fetchAllProblems();
});



async function fetchAllProblems() {

    console.log("📥 Fetching ALL posts...");

    const snapshot = await getDocs(collection(friendDB, "posts"));

    const problems = [];

    for (const docSnap of snapshot.docs) {

        const p = docSnap.data();

        const ngoRef = doc(friendDB, "users", p.NGOid);
        const ngoSnap = await getDoc(ngoRef);

        let ngoName = "Unknown NGO";
        let sector = "Unknown";

        if (ngoSnap.exists()) {
            const ngoData = ngoSnap.data();
            ngoName = ngoData.name;
            sector = ngoData.sector;
        }

        problems.push({
            ngoName,
            sector,
            title: p.title || "No Title",
            body: p.body || "No Description",
            ngo_id: p.NGOid,
            post_id: p.time,
            critical: Boolean(p.critical)
        });
    }

    console.log("✅ ALL PROBLEMS:", problems);

    renderProblems(problems);
}


async function handleApplyClick(problem, button) {
    try {
        console.log("🟢 APPLY CLICK:", problem);

        /* ===== DUPLICATE CHECK ===== */
        const q = query(
            collection(db, "addressedproblems"),
            where("uid", "==", profileId),
            where("post_id", "==", problem.post_id)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log("⚠️ DUPLICATE FOUND");
            alert("You have already applied for this opportunity.");
            return;
        }

        console.log("✅ NO DUPLICATE → SAVING");


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

        console.log("✅ SAVED SUCCESSFULLY");

        alert("Thank you for volunteering. The NGO has been notified and will reach out to you shortly.");

        button.textContent = "Applied";
        button.disabled = true;

    } catch (error) {
        console.error("❌ APPLY ERROR:", error);
    }
}


function renderProblems(problems) {

    matchesGrid.innerHTML = "";

    if (problems.length === 0) {
        matchesGrid.innerHTML = "<p>No Opportunities Found</p>";
        return;
    }

    problems.forEach(problem => {

        const card = document.createElement("div");
        card.classList.add("problem-card");

        if (problem.critical) {
            card.classList.add("critical");
        }

        card.innerHTML = `
            <h3 class="ngo-name">${problem.ngoName} ${problem.critical ? "⚠️" : ""}</h3>
            <p class="problem-sector">${problem.sector}</p>
            <p class="problem-title">${problem.title}</p>

            <div class="card-buttons">
                <button class="apply-btn">Apply</button>
                <button class="more-btn">More Info</button>
            </div>
        `;

        const applyBtn = card.querySelector(".apply-btn");

        applyBtn.addEventListener("click", () => {
            handleApplyClick(problem, applyBtn);
        });

        card.querySelector(".more-btn").addEventListener("click", () => {
            popupNgo.textContent = problem.ngoName;
            popupSector.textContent = problem.sector;
            popupTitle.textContent = problem.title;
            popupDesc.textContent = problem.body;

            popup.classList.remove("hidden");
        });

        matchesGrid.appendChild(card);
    });
}


closePopupBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
});

popup.addEventListener("click", (e) => {
    if (e.target === popup) {
        popup.classList.add("hidden");
    }
});