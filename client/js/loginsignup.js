document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (token) {
        await checkUserRole(token);
    }
    const formSignup = document.getElementById("formSignup");

    let currentUser;
    //CREATE COMMENT TOFIX
    // fetch("/api/comment", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //         ComUserIdFK: 31,
    //         ComPostIdFK: 4,
    //         ComComIdFK: null,
    //         ComContent: "This is a test comment"
    //     })
    // })
    //     .then(res => res.json())
    //     .then(data => console.log(data));


    //FETCH POSTS LIKES AND DISLIKES TOFIX
    // fetch("/api/postLike")
    //     .then(res => res.json())
    //     .then(data => console.log(data));

    //FETCH COMMENT LIKES AND DISLIKES TOFIX
    // fetch("/api/commentLike")
    //      .then(res => res.json())
    //    .then(data => console.log(data));

    //CREATE LIKEDISLIKE ON POST TOFIX 1 is like 0 is dislike
    // fetch("/api/likedislike", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //         LikDisUserIdFK: 1,
    //         postComID: 1,
    //         isPost: 1,
    //         isLike: 1
    //     })
    // })
    //     .then(res => res.json())
    //     .then(data => console.log(data));


    //CREATE LIKEDISLIKE ON COMMENT TOFIX
    // fetch("/api/likedislike", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //         LikDisUserIdFK: 1,
    //         postComID: 1,
    //         isPost: 0,
    //         isLike: 1
    //     })
    // })
    //     .then(res => res.json())
    //     .then(data => console.log(data));


    async function getUserData(token) {
        const res = await fetch("/api/userInfo", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            localStorage.removeItem("token");
            return;
        }

        const data = await res.json();
    }

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
                    console.log(data.token);
                    checkUserRole(data.token);
                    window.dispatchEvent(new CustomEvent('userLoggedIn'));

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

    const btnEdit = document.getElementById("btnEdit");
    btnEdit.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        if (token) {
            await checkUserRole(token);
        }
        console.log("edit user");
        const res = await fetch("/api/userInfo", {
            headers: {"Authorization": `Bearer ${token}`}
        });
        if (!res.ok) {
            localStorage.removeItem("token");
            return;
        }

        const data = await res.json();
        let userRes = await fetch(`/user/${data.userIDPK}`, {
            headers: {"Authorization": `Bearer ${token}`}
        });

        const userData = await userRes.json();

        console.log(userData);

        document.getElementById("inputFirstNameEdit").value = userData.user.UserFirstname;
        document.getElementById("inputLastNameEdit").value = userData.user.UserLastname;
        document.getElementById("inputEmailEdit").value = userData.user.UserEmail;
        document.getElementById("inputProfilePictureEdit").files = userData.user.UserPicturePath;

    })

    const formEdit = document.getElementById("formEditUser");

    formEdit.addEventListener("submit", async event => {
        event.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) return;

        const infoRes = await fetch("/api/userInfo", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!infoRes.ok) return;
        const info = await infoRes.json();

        const firstname = document.getElementById("inputFirstNameEdit").value.trim();
        const lastname  = document.getElementById("inputLastNameEdit").value.trim();
        const email     = document.getElementById("inputEmailEdit").value.trim();
        const photoFile = document.getElementById("inputProfilePictureEdit").files?.[0];

        let photoPath = null;
        if (photoFile) {
            const formData = new FormData();
            formData.append("myFile", photoFile);
            const uploadRes = await fetch("/api/upload/pfp", {
                method: "POST",
                body: formData
            });
            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                photoPath = uploadData.filePath;
            }
        }

        const userRes = await fetch(`/user/${info.userIDPK}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const userData = await userRes.json();

        const res = await fetch(`/editUser/${info.userIDPK}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                firstname,
                lastname,
                email,
                employeeFK: userData.user.EmpIdPK ?? null,
                userIDPK: info.userIDPK,
            })
        });

        if (res.ok) {
            await checkUserRole(token);

            const modalEl = document.getElementById("modalEdit");
            bootstrap.Modal.getInstance(modalEl)?.hide();
        } else {
            const err = await res.json();
            console.error("Edit failed:", err);
        }
    });
})



async function checkUserRole(token){
    try {
        const res = await fetch("/api/userInfo", {
            headers: {"Authorization": `Bearer ${token}`}
        });

        if (!res.ok) {
            localStorage.removeItem("token");
            return;
        }

        const data = await res.json();
        let userRes = await fetch(`/user/${data.userIDPK}`, {
            headers: {"Authorization": `Bearer ${token}`}
        });
        const userData = await userRes.json();
        const userJob = document.getElementById("userJob");

        document.getElementById("userName").textContent = userData.user.UserFirstname + " " + userData.user.UserLastname;
        userJob.textContent = userData.user.EmpDescription ?? "";
        document.getElementById("userEmail").textContent = userData.user.UserEmail ?? "";

        if (userData.user.EmpDescription == null) {
            userJob.classList.add = "d-none";
        } else {
            if (userJob.classList.contains("d-none")) {
                userJob.classList.remove("d-none");
            }
        }

        console.log("User info:", data);

        // Hide login button, show logout
        document.getElementById("btnLogin")?.classList.add("d-none");
        document.getElementById("btnLogOut")?.classList.remove("d-none");

        // Close login modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById("modalLogin"));
        if (loginModal) loginModal.hide();

        document.getElementById("btnEdit").classList.remove("d-none");
        // Show post button if employee (has a role)
        if (data.userRole != null) {
            document.querySelector('a[href="createpost.html"]')?.classList.remove("d-none");
        }

        // Show admin button if admin
        if (data.isAdmin === 1) {
            document.querySelector('a[href="adminpage.html"]')?.classList.remove("d-none");
        }


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

