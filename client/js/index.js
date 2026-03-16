document.addEventListener("DOMContentLoaded", () => {
    'use strict'

    const forms = document.querySelectorAll('.needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', async event => {
            const password = document.getElementById("inputSignupPassword").value
            const confirmField = document.getElementById("inputSignupConfirmPassword")

            if (password !== confirmField.value) {
                confirmField.setCustomValidity("Passwords do not match")
            } else {
                confirmField.setCustomValidity("")
            }
            form.classList.add('was-validated')

            if (form.checkValidity()) {
                await createUser()
            }
            else
            {
                event.preventDefault()
                event.stopPropagation()
            }

        })
    })
    const emailField = document.getElementById("inputLoginEmail")
    const passField = document.getElementById("inputLoginPassword")
    fetch("/user/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ emailField, passField })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log("Login successful!");
                // Redirect to dashboard
                window.location.href = "/dashboard";
            } else {
                console.log("Error:", data.error);
            }
        })
        .catch(err => console.log("Request failed:", err));
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