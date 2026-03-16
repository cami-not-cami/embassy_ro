
document.addEventListener("DOMContentLoaded", async function () {
document.getElementById("search").addEventListener("click", createUser)
// fetch('/dbq?id=1')
//     .then(res => res.json())
//     .then(data => console.log(data));
})
 async function createUser() {
    const res = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstname: "Cami",
            lastname: "Doe",
            email: "Example@gmail.com",
            password: "Password123.",

        })
    });

    const data = await  res.json()
    console.log(data); // { id: 2 }
}