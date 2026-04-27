const loginButton=document.querySelector(".login");
const newVolunteer=document.querySelector(".newvolunteer");
function goToLogin(){
    window.location.href="login.html";
}
function goToNewLogin(){
    window.location.href="newlogin.html";
}
loginButton.addEventListener("click",goToLogin);
newVolunteer.addEventListener("click",goToNewLogin);

