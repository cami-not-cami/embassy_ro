document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (token) {
        await checkUserRole(token);
    }
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
            console.log("create usaer")
            await createUser()
        } else {
            event.preventDefault()
            event.stopPropagation()
        }

    })
    const modal = document.getElementById("formLogin")

    modal.addEventListener("submit", async event => {
        event.preventDefault()

        const emailField = document.getElementById("inputLoginEmail").value
        const passField = document.getElementById("inputLoginPassword").value

        fetch("/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email: emailField, password: passField})
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log("Login successful!");
                    localStorage.setItem("token", data.token);
                    console.log(token);
                    console.log("BEFORE USERROLE");
                    checkUserRole(token);
                } else {
                    console.log("Error:", data.error);
                }
            })
            .catch(err => console.log("Request failed:", err));
    })

    const btnLogOut = document.getElementById("btnLogOut");
    if(btnLogOut) {
        btnLogOut.addEventListener("click", async event => {
            localStorage.removeItem("token");
            window.location.href = "/";
        })
    }
})

async function checkUserRole(token){
    try {
        const res = await fetch("/api/userInfo", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            localStorage.removeItem("token");
            return;
        }

        const data = await res.json();
        console.log("User info:", data);

        // Hide login button, show logout
        document.getElementById("btnLogin")?.classList.add("d-none");

        // Show post button if employee (has a role)
        if (data.userRole != null) {
            document.querySelector('a[href="createpost.html"]')?.classList.remove("d-none");
        }

        // Show admin button if admin
        if (data.isAdmin === 1) {
            document.querySelector('a[href="adminpage.html"]')?.classList.remove("d-none");
        }

        window.location.reload();

    } catch (err) {
        console.log("checkUserRole failed:", err);
    }
}

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

