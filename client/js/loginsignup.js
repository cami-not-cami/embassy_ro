
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const formSignup = document.getElementById("formSignup");

    formSignup.addEventListener('submit', async event => {
        const password = document.getElementById("inputSignupPassword").value
        const confirmField = document.getElementById("inputSignupConfirmPassword")

        if (password !== confirmField.value) {
            confirmField.setCustomValidity("Passwords do not match")
        } else {
            confirmField.setCustomValidity("")
        }
        formSignup.classList.add('was-validated')

        if (formSignup.checkValidity()) {
            await createUser()
        }
        else
        {
            event.preventDefault()
            event.stopPropagation()
        }

    })
    const modal= document.getElementById("formLogin")

    modal.addEventListener("submit", async event => {
        event.preventDefault()
        console.log("IN MODAL")
        const emailField = document.getElementById("inputLoginEmail").value
        const passField = document.getElementById("inputLoginPassword").value
        console.log(passField)
        fetch("/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: emailField,password: passField })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log("Login successful!");
                    localStorage.setItem("token", data.token);

                } else {
                    console.log("Error:", data.error);
                }
            })
            .catch(err => console.log("Request failed:", err));
    })


})

async function createUser() {
    const res = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstname: document.getElementById("inputFirstName").value,
            lastname: document.getElementById("inputLastName").value,
            email: document.getElementById("inputSignupEmail").value,
            password: document.getElementById("inputSignupPassword").value,
        })
    })
}