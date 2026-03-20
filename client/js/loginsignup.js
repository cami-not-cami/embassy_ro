

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const formSignup = document.getElementById("formSignup");


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

        const emailField = document.getElementById("inputLoginEmail").value
        const passField = document.getElementById("inputLoginPassword").value

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

