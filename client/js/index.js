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

    const emailField = document.getElementById("inputLoginEmail").value
    const password = document.getElementById("inputLoginPassword").value

    console.log(password)
    console.log(emailField)
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