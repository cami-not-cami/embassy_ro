
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const formPost = document.getElementById("formPost");
    const inputTitle = document.getElementById("inputTitle");
    const inputContent = document.getElementById("inputContent");
    const inputImage = document.getElementById("inputImage");


        formPost.addEventListener("submit", (e) => {
            e.preventDefault();

            const title = inputTitle.value;
            const content = inputContent.value;
            const image = inputImage.value;
            console.log(image);
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

            fetch("/createPost", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    createdAt: now,
                    updatedAt: now,
                    imagePath: image
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.id) {
                        console.log("Post created!");

                    } else {
                        console.log("Error:", data.error);
                    }
                })
                .catch(err => console.log("Request failed:", err));
        });


})

