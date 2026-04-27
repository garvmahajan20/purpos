import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyD1rUwjbtP-ysyl-zrABom85DCXFZdYoY8",
    authDomain: "urpos-fb090.firebaseapp.com",
    projectId: "urpos-fb090",
    storageBucket: "urpos-fb090.firebasestorage.app",
    messagingSenderId: "6887971621",
    appId: "1:6887971621:web:abfad59473e9078b2158cc",
    measurementId: "G-K7SGV8NN2G"
};

const friendApp = initializeApp(firebaseConfig, "friendApp");
const db = getFirestore(friendApp);

const ngoGrids = document.getElementById("ngogrids");
const popupOverlay = document.getElementById("popupOverlay");
const closePopup = document.getElementById("closePopup");

const popupImage = document.getElementById("popupImage");
const popupName = document.getElementById("popupName");
const popupSector = document.getElementById("popupSector");
const popupLocality = document.getElementById("popupLocality");
const popupCity = document.getElementById("popupCity");
const popupState = document.getElementById("popupState");
const popupPurpose = document.getElementById("popupPurpose");

const galleryContainer = document.getElementById("galleryContainer");


const imageViewer = document.getElementById("imageViewer");
const viewerImage = document.getElementById("viewerImage");
const closeViewer = document.getElementById("closeViewer");

const DEFAULT_IMAGE = "default-avatar.png";

async function fetchAllNGOs() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const ngos = [];

        querySnapshot.forEach(docSnap => {
            ngos.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        renderNGOList(ngos);

    } catch (error) {
        console.error("Error fetching NGOs:", error);
    }
}

function renderNGOList(ngos) {
    ngoGrids.innerHTML = "";

    ngos.forEach(ngo => {
        const card = document.createElement("div");
        card.classList.add("ngo-card");

        card.innerHTML = `
            <h3 class="ngo-name">${ngo.name || "No name"}</h3>
            <p class="ngo-sector">${ngo.sector || "No sector"}</p>
        `;

        card.addEventListener("click", () => {


            popupImage.src = ngo.imageUrl || DEFAULT_IMAGE;


            popupName.textContent = ngo.name || "No Name";
            const sectorBadge = document.getElementById("popupSectorBadge");
            if (sectorBadge) sectorBadge.textContent = ngo.sector || "N/A";
            if (popupSector) popupSector.textContent = "Sector: " + (ngo.sector || "N/A");
            popupLocality.textContent = "Locality: " + (ngo.locality || "N/A");
            popupCity.textContent = "City: " + (ngo.city || "N/A");
            popupState.textContent = "State: " + (ngo.state || "N/A");
            popupPurpose.textContent = ngo.purpose || "No purpose added";


            galleryContainer.innerHTML = "";


            if (ngo.galleryUrls && ngo.galleryUrls.length > 0) {

                ngo.galleryUrls.forEach(url => {
                    const img = document.createElement("img");
                    img.src = url;


                    img.onerror = () => {
                        console.log("Image failed:", url);
                        img.src = DEFAULT_IMAGE;
                    };


                    img.addEventListener("click", (e) => {
                        e.stopPropagation();
                        viewerImage.src = url || DEFAULT_IMAGE;
                        imageViewer.classList.remove("hidden");
                    });

                    galleryContainer.appendChild(img);
                });

            } else {

                const img = document.createElement("img");
                img.src = DEFAULT_IMAGE;

                img.addEventListener("click", (e) => {
                    e.stopPropagation()
                    viewerImage.src = DEFAULT_IMAGE;
                    imageViewer.classList.remove("hidden");
                });

                galleryContainer.appendChild(img);
            }


            popupOverlay.classList.remove("hidden");
        });

        ngoGrids.appendChild(card);
    });


    closePopup.addEventListener("click", () => {
        popupOverlay.classList.add("hidden");
    });

    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.classList.add("hidden");
        }
    });
}


closeViewer.addEventListener("click", (e) => {
    e.stopPropagation();
    imageViewer.classList.add("hidden");
    viewerImage.src = "";
});

imageViewer.addEventListener("click", (e) => {
    if (e.target === imageViewer) {
        imageViewer.classList.add("hidden");
    }
});

window.addEventListener("DOMContentLoaded", () => {
    fetchAllNGOs();
});