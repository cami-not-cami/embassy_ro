
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const formPost = document.getElementById("formPost");
    const inputTitle = document.getElementById("inputTitle");
    const inputContent = document.getElementById("inputContent");
    const fileInput = document.getElementById('inputImage');


    formPost.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = inputTitle.value;
        const content = inputContent.value;
        const file = fileInput.files[0];

        try {
            const formData = new FormData();
            formData.append('myFile', file);

            const uploadRes = await fetch("/upload/post", {
                method: "POST",
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                alert("Upload failed:", uploadData.error);
                return;
            }

            const imagePath = uploadData.filePath;
           alert("File uploaded:");


            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const postRes = await fetch("/createPost", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    imagePath: imagePath,
                    createdAt: now,
                    updatedAt: now
                })
            });

            const postData = await postRes.json();

            if (postData.id) {
                console.log("Post created!");
                formPost.reset();
            } else {
                console.log("Error:", postData.error);
            }
        } catch (err) {
            console.log("Request failed:", err);
        }
    });
})

