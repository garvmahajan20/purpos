const darkModeBtn = document.getElementById("darkmode");

window.onload = () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("darkmode");
    }
};


darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("darkmode");

    if (document.body.classList.contains("darkmode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});