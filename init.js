const auth = new Auth();

document.querySelector(".logout").addEventListener("click", (e) => {
    e.preventDefault();
    auth.logout();
});