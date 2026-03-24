document.addEventListener("DOMContentLoaded", async () => {
    const postsContainer = document.getElementById("postsContainer");

    try {
        const res = await fetch("/posts");
        const posts = await res.json();

        postsContainer.innerHTML = "";

        if (posts.length === 0) {
            postsContainer.innerHTML = `<p class="text-center">No posts yet.</p>`;
            return;
        }

        posts.forEach(post => renderPost(post, postsContainer));

    } catch (err) {
        console.error("Failed to load posts:", err);
    }

    window.addEventListener('userLoggedIn', () => {
        document.querySelectorAll('.btn-like').forEach(btn => {
            const postId = parseInt(btn.dataset.postId);
            const dislikeBtn = btn.parentElement.querySelector('.btn-dislike');
            showActualLikesDislikes(postId, btn, dislikeBtn);
        });
    });

    // EDIT POST SAVE
    document.addEventListener('click', async (e) => {
        if (e.target.id !== 'btnSavePost') return;

        const token = localStorage.getItem("token");
        const title = document.getElementById('editPostTitle').value.trim();
        const content = document.getElementById('editPostContent').value.trim();

        if (!title || !content) {
            document.getElementById('formEditPost').classList.add('was-validated');
            return;
        }

        const res = await fetch(`/editPost/${_activeEditPost.PostIdPK}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                postEmpFK: _activeEditPost.PostEmpIdFK,
                title,
                content,
                updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
                imagePath: _activeEditPost.PostImagePath ?? null
            })
        });

        if (res.ok) {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditPost')).hide();
            const postsContainer = document.getElementById("postsContainer");
            postsContainer.innerHTML = "";
            const updated = await (await fetch('/posts')).json();
            updated.forEach(p => renderPost(p, postsContainer));
        } else {
            alert("Could not save changes.");
        }
    });

    // DELETE IN EDIT MODAL
    document.getElementById('btnDeleteFromEdit').addEventListener('click', () => {
        openDeletePostModal(_activeEditPost);
    });

    // CONFIRM DELETE
    document.getElementById('btnConfirmDeletePost').addEventListener('click', () => {
        deletePost(_activeEditPost);
    });
});

function renderPost(post, container) {
    const imageHtml = post.PostImagePath
        ? `<div class="row">
               <div class="d-flex align-items-center justify-content-center ps-5 pe-5">
                   <img src="${post.PostImagePath}" class="w-100" style="object-fit: contain; max-height: 400px;" alt="Post image">
               </div>
           </div>`
        : "";

    // CHECK IF IT'S BEEN EDITED
    let createdAt = new Date(post.PostCreatedAt).toLocaleTimeString();
    let updatedAt = new Date(post.PostUpdatedAt).toLocaleTimeString();
    let actualdate;

    if (createdAt !== updatedAt) {
        updatedAt = new Date(post.PostUpdatedAt).toLocaleDateString();
        actualdate = `Edited at: ${updatedAt}`;
    } else {
        createdAt = new Date(post.PostCreatedAt).toLocaleDateString();
        actualdate = createdAt;
    }

    // AUTHOR AVATAR: initials, not post image
    const initials = ((post.UserFirstname?.[0] ?? "") + (post.UserLastname?.[0] ?? "")).toUpperCase() || "?";
    const avatarHtml = post.UserPicturePath
        ? `<img src="${post.UserPicturePath}" class="rounded-circle w-100 h-100" style="object-fit:cover;" alt="avatar">`
        : `<span>${initials}</span>`;

    const postEl = document.createElement("div");
    postEl.className = "container-fluid mt-4";
    postEl.innerHTML = `
        <div class="row">
            <div class="col-2"></div>
            <div class="col">
                <div class="card rounded-4" style="background-color: #f6d4cf;">
                    <div class="card-body">
                        <div class="row">
                            <div class="d-flex align-items-center justify-content-between container-fluid">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                                         style="width:48px;height:48px;color:white;font-weight:bold;">
                                        ${avatarHtml}
                                    </div>
                                    <div>
                                        <div class="fw-bold">${post.UserFirstname ?? ""} ${post.UserLastname ?? ""}</div>
                                        <div class="text-muted small">${post.EmpDescription ?? ""}</div>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center gap-2">
                                    <div class="text-muted small">${actualdate}</div>
                                    <div class="post-menu-wrapper d-none" data-post-id="${post.PostIdPK}" data-post-emp="${post.PostEmpIdFK}">
                                        <div class="dropdown">
                                            <button class="btn btn-sm btn-link text-muted p-0 post-menu-btn"
                                                    type="button" data-bs-toggle="dropdown" aria-expanded="false"
                                                    title="Post options">
                                                <i class="bi bi-three-dots-vertical"></i>
                                            </button>
                                            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                                                <li><button class="dropdown-item btn-post-edit" type="button">
                                                    <i class="bi bi-pencil me-2"></i>Edit
                                                </button></li>
                                                <li><button class="dropdown-item btn-post-delete text-danger" type="button">
                                                    <i class="bi bi-trash me-2"></i>Delete
                                                </button></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <h4 class="ps-5 pe-5">${post.PostTitle}</h4>
                        </div>
                        <div class="row">
                            <div class="ps-5 pe-5">${post.PostContent}</div>
                        </div>
                        ${imageHtml}
                        <div class="row mt-3">
                            <div class="d-flex align-items-center justify-content-start ps-5 pe-5 gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-hand-thumbs-up btn-like" viewBox="0 0 16 16" style="cursor:pointer" data-post-id="${post.PostIdPK}">
                                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-hand-thumbs-down btn-dislike" viewBox="0 0 16 16" style="cursor:pointer" data-post-id="${post.PostIdPK}">
                                    <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1"/>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-chat btn-comment" viewBox="0 0 16 16" style="cursor:pointer"
                                     data-post-id="${post.PostIdPK}"
                                     data-post-title="${post.PostTitle}"
                                     data-post-content="${encodeURIComponent(post.PostContent)}"
                                     data-post-image="${post.PostImagePath ?? ''}"
                                     data-author-first="${post.EmpFirstname ?? ''}"
                                     data-author-last="${post.EmpLastname ?? ''}"
                                     data-author-job="${post.EmpJobTitle ?? ''}">
                                    <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-2"></div>
        </div>
    `;

    // LIKES/DISLIKES ON CARD
    const likeBtn    = postEl.querySelector('.btn-like');
    const dislikeBtn = postEl.querySelector('.btn-dislike');

    showActualLikesDislikes(post.PostIdPK, likeBtn, dislikeBtn);

    likeBtn.addEventListener('click', async () => {
        await toggleLikesDislikes(post.PostIdPK, 1, 1);
        showActualLikesDislikes(post.PostIdPK, likeBtn, dislikeBtn);
    });
    dislikeBtn.addEventListener('click', async () => {
        await toggleLikesDislikes(post.PostIdPK, 1, 0);
        showActualLikesDislikes(post.PostIdPK, likeBtn, dislikeBtn);
    });

    // COMMENT BUTTON
    const commentBtn = postEl.querySelector('.btn-comment');
    commentBtn.addEventListener('click', () => openCommentModal(post));

    container.appendChild(postEl);

    // SHOW MENU ONLY FOR POST OWNER / ADMIN
    (async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const info = await getUserInfo(token);
            if (!info) return;
            const wrapper = postEl.querySelector('.post-menu-wrapper');
            const isOwner = info.userIDPK == post.PostEmpIdFK;
            const isAdmin = info.isAdmin === 1;
            if (isOwner || isAdmin) {
                wrapper.classList.remove('d-none');
            }
        } catch {}
    })();

    // EDIT BUTTON
    postEl.querySelector('.btn-post-edit').addEventListener('click', () => {
        openEditPostModal(post);
    });

    // DELETE BUTTON
    postEl.querySelector('.btn-post-delete').addEventListener('click', () => {
        openDeletePostModal(post);
    });
}

// EDIT POST STUFF
let _activeEditPost = null;

function openEditPostModal(post) {
    _activeEditPost = post;
    document.getElementById('editPostTitle').value = post.PostTitle ?? '';
    document.getElementById('editPostContent').value = post.PostContent ?? '';
    document.getElementById('formEditPost').classList.remove('was-validated');
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditPost'));
    modal.show();
}

function openDeletePostModal(post) {
    _activeEditPost = post;
    const editModalInstance = bootstrap.Modal.getInstance(document.getElementById('modalEditPost'));
    if (editModalInstance) editModalInstance.hide();
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDeletePost'));
    modal.show();
}

async function deletePost(post) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/post/${post.PostIdPK}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ postEmpFK: post.PostEmpIdFK })
    });
    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalDeletePost')).hide();
        const postsContainer = document.getElementById("postsContainer");
        postsContainer.innerHTML = "";
        const updated = await (await fetch('/posts')).json();
        updated.forEach(p => renderPost(p, postsContainer));
    } else {
        alert("Could not delete post.");
    }
}

// LIKES AND DISLIKES

async function toggleLikesDislikes(postComID, isPost, isLike) {
    const token = localStorage.getItem("token");
    if (!token) { alert("You must be logged in to vote."); return; }

    const info = await getUserInfo(token);
    if (!info) return;
    const userId = info.userIDPK;

    // Fetch current vote from the correct endpoint
    const voteEndpoint = isPost === 1
        ? `/api/myVote/post/${postComID}`
        : `/api/myVote/comment/${postComID}`;

    const voteRes = await fetch(voteEndpoint, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const voteData = voteRes.ok ? await voteRes.json() : { reaction: null };
    const currentReaction = voteData.reaction; // "liked", "disliked", or null

    const isAlreadyThis = (isLike === 1 && currentReaction === "liked") ||
        (isLike === 0 && currentReaction === "disliked");

    if (isAlreadyThis) {
        // REMOVE VOTE
        await fetch(`/api/likedislike/${userId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ postComId: postComID, isPost })
        });
    } else if (currentReaction !== null) {
        // FLIP VOTE
        await fetch(`/api/likedislike/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ postComID, isPost, isLike })
        });
    } else {
        // NEW VOTE
        await fetch("/api/likeDislike", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ LikDisUserIdFK: userId, postComID, isPost, isLike })
        });
    }
}

async function getPostLikeCounts(postId) {
    const res  = await fetch("/api/postLike");
    const data = await res.json();
    return data.find(p => p.PostIdPK === postId) ?? { likes: 0, dislikes: 0 };
}

async function getUserVoteForPost(postId) {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const res = await fetch(`/api/myVote/post/${postId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return null;
        return await res.json(); // { reaction: "liked" | "disliked" | null }
    } catch { return null; }
}

async function getUserVoteForComment(commentId) {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const res = await fetch(`/api/myVote/comment/${commentId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return null;
        return await res.json(); // { reaction: "liked" | "disliked" | null }
    } catch { return null; }
}

async function showActualLikesDislikes(postId, likeBtn, dislikeBtn) {
    const vote     = await getUserVoteForPost(postId);
    // FIX: server returns { reaction: "liked"|"disliked"|null }, not { isLike }
    const liked    = vote?.reaction === "liked";
    const disliked = vote?.reaction === "disliked";
    likeBtn.style.color    = liked    ? 'var(--clr-plum-dark)' : '';
    likeBtn.style.filter   = liked    ? 'drop-shadow(0 0 3px var(--clr-plum))' : '';
    dislikeBtn.style.color  = disliked ? 'var(--clr-coral)'    : '';
    dislikeBtn.style.filter = disliked ? 'drop-shadow(0 0 3px var(--clr-coral))' : '';
}

async function showCommentVoteState(commentId, likeBtn, dislikeBtn) {
    const vote     = await getUserVoteForComment(commentId);
    // FIX: server returns { reaction: "liked"|"disliked"|null }, not { isLike }
    const liked    = vote?.reaction === "liked";
    const disliked = vote?.reaction === "disliked";
    likeBtn.style.color    = liked    ? 'var(--clr-plum-dark)' : '';
    likeBtn.style.filter   = liked    ? 'drop-shadow(0 0 3px var(--clr-plum))' : '';
    dislikeBtn.style.color  = disliked ? 'var(--clr-coral)'    : '';
    dislikeBtn.style.filter = disliked ? 'drop-shadow(0 0 3px var(--clr-coral))' : '';
}

// COMMENT STUFFS

let _activePostId = null;
let _replyToCommentId = null;

async function openCommentModal(post) {
    _activePostId = post.PostIdPK;
    _replyToCommentId = null;

    // FILL POST PREVIEW
    const initials = (post.EmpFirstname?.[0] ?? "?").toUpperCase();
    document.getElementById("commentPostAuthorAvatar").textContent = initials;
    document.getElementById("commentPostAuthorName").textContent =
        `${post.EmpFirstname ?? ""} ${post.EmpLastname ?? ""}`.trim();
    document.getElementById("commentPostAuthorJob").textContent = post.EmpJobTitle ?? "";
    document.getElementById("commentPostText").textContent = post.PostContent ?? "";

    // POST IMAGE
    const imgBox = document.getElementById("commentPostImage");
    if (post.PostImagePath) {
        imgBox.innerHTML = `<img src="${post.PostImagePath}" class="rounded-3 w-100 mt-1" style="max-height:180px;object-fit:cover;" alt="">`;
    } else {
        imgBox.innerHTML = "";
    }

    // SELF AVATAR
    const selfName = document.getElementById("userName")?.textContent?.trim() ?? "";
    const selfInitial = selfName?.[0]?.toUpperCase() ?? "?";
    document.getElementById("commentSelfAvatar").textContent = selfInitial;

    await loadComments(post.PostIdPK);

    // LIKES/DISLIKES IN MODAL
    const refreshModalCounts = async () => {
        const entry    = await getPostLikeCounts(post.PostIdPK);
        document.getElementById("commentModalLikeCount").textContent    = entry.likes;
        document.getElementById("commentModalDislikeCount").textContent = entry.dislikes;

        const vote     = await getUserVoteForPost(post.PostIdPK);
        // FIX: use vote?.reaction not vote?.isLike
        const liked    = vote?.reaction === "liked";
        const disliked = vote?.reaction === "disliked";
        const likeEl    = document.getElementById("commentModalLike");
        const dislikeEl = document.getElementById("commentModalDislike");
        likeEl.style.color     = liked    ? 'var(--clr-blush)' : '';
        likeEl.style.filter    = liked    ? 'drop-shadow(0 0 4px rgba(255,255,255,.8))' : '';
        dislikeEl.style.color  = disliked ? 'var(--clr-coral)' : '';
        dislikeEl.style.filter = disliked ? 'drop-shadow(0 0 4px var(--clr-coral))' : '';
    };

    await refreshModalCounts();

    document.getElementById("commentModalLike").onclick = async () => {
        await toggleLikesDislikes(post.PostIdPK, 1, 1);
        await refreshModalCounts();
    };
    document.getElementById("commentModalDislike").onclick = async () => {
        await toggleLikesDislikes(post.PostIdPK, 1, 0);
        await refreshModalCounts();
    };

    // NEW COMMENT
    document.getElementById("submitComment").onclick = async () => {
        const token = localStorage.getItem("token");
        const text = document.getElementById("newCommentText").value.trim();
        if (!text || !token) return;
        const info = await getUserInfo(token);
        if (!info) return;
        await fetch("/api/comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ComUserIdFK: info.userIDPK,
                ComPostIdFK: _activePostId,
                ComComIdFK: _replyToCommentId,
                ComContent: text
            })
        });
        document.getElementById("newCommentText").value = "";
        _replyToCommentId = null;
        document.querySelectorAll('.reply-input-area').forEach(a => a.innerHTML = "");
        document.getElementById("newCommentText").placeholder = "Write a comment…";
        await loadComments(_activePostId);
    };

    const modal = new bootstrap.Modal(document.getElementById("modalComment"));
    modal.show();
}

async function loadComments(postId) {
    const list = document.getElementById("commentsList");
    list.innerHTML = `<div class="text-center py-3"><div class="spinner-border spinner-border-sm" style="color:#98768e;"></div></div>`;
    try {
        const res = await fetch(`/api/comment/${postId}`);
        const allComments = await res.json();
        const topLevel = allComments.filter(c => !c.ComComIdFK);

        if (topLevel.length === 0) {
            list.innerHTML = `<p class="text-center text-muted small py-3">No comments yet. Be the first!</p>`;
            return;
        }

        list.innerHTML = "";
        topLevel.forEach(comment => {
            list.appendChild(renderComment(comment, allComments, 0));
        });
    } catch (err) {
        list.innerHTML = `<p class="text-center text-muted small">Could not load comments.</p>`;
        console.error(err);
    }
}

function renderComment(comment, allComments, depth = 0) {
    const initials = comment.ComUserFirstname?.[0]?.toUpperCase() ?? "?";
    const name = `${comment.ComUserFirstname ?? ""} ${comment.ComUserLastname ?? ""}`.trim() || "Visitor";
    const isReply = depth > 0;

    const parentComment = isReply ? allComments.find(c => c.ComIdPK === comment.ComComIdFK) : null;
    const parentName = parentComment
        ? (`${parentComment.ComUserFirstname ?? ""} ${parentComment.ComUserLastname ?? ""}`.trim() || "Visitor")
        : null;
    const replyingTo = parentName
        ? `<span class="ms-2 text-plum" style="font-size:.78rem;">Replying to @${parentName}</span>`
        : "";

    const bgColors = ['white', '#edd4cc', '#e8c8be'];
    const bg = bgColors[Math.min(depth, bgColors.length - 1)];

    const el = document.createElement("div");
    el.className = depth === 0 ? "mb-3" : "mb-2";
    el.innerHTML = `
        <div class="rounded-3 p-3" style="background:${bg};">
            <div class="d-flex align-items-center justify-content-between mb-1">
                <div class="d-flex align-items-center gap-2">
                    <div class="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center text-white fw-bold bg-plum"
                         style="width:32px;height:32px;font-size:.75rem;">${initials}</div>
                    <div>
                        <span class="fw-semibold" style="font-size:.85rem;">${name}</span>
                        ${replyingTo}
                    </div>
                </div>
                <button class="btn p-0 text-muted" style="font-size:1.1rem;line-height:1;" title="More">···</button>
            </div>
            <p class="mb-2 text-ink" style="font-size:.85rem;">${comment.ComContent}</p>
            <div class="d-flex align-items-center gap-3">
                <button class="btn p-0 text-muted btn-comment-like" style="font-size:.78rem;" data-comment-id="${comment.ComIdPK}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16"><path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/></svg>
                </button>
                <button class="btn p-0 text-muted btn-comment-dislike" style="font-size:.78rem;" data-comment-id="${comment.ComIdPK}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-hand-thumbs-down" viewBox="0 0 16 16"><path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1"/></svg>
                </button>
                <button class="btn p-0 btn-reply text-plum" style="font-size:.78rem;" data-comment-id="${comment.ComIdPK}" data-author="${name}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-reply me-1" viewBox="0 0 16 16"><path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.7 8.7 0 0 0-1.7-.257c-.073-.004-.148-.006-.224-.006h-.135a.5.5 0 0 0-.5.5v1.153c0 .134-.164.198-.266.134L2.862 8.855a.5.5 0 0 0 0 .826l3.553 2.246a.5.5 0 0 0 .754-.373l.003-.04V10.5a.5.5 0 0 0 .5-.5c.344 0 .91-.013 1.543.108.638.122 1.33.376 1.921.884a6.6 6.6 0 0 1 .898.946c.343.476.61 1.024.762 1.63.052.2.1.407.14.618.035.172.065.348.085.527L12.003 15l.01-.068c-.07-.474-.194-.93-.36-1.345-.33-.824-.836-1.498-1.43-2.013C9.15 10.65 7.87 10.3 6.849 10.3v-.513a.5.5 0 0 0-.5-.5 8 8 0 0 0-.116.001L3.44 7.13a.144.144 0 0 1 .002-.248z"/></svg>
                    Reply
                </button>
            </div>
            <div class="reply-input-area mt-2"></div>
        </div>
    `;

    // RECURSIVE CHILDREN
    const children = allComments.filter(c => c.ComComIdFK === comment.ComIdPK);
    if (children.length > 0) {
        const repliesContainer = document.createElement("div");
        const indentPx = Math.min(depth + 1, 3) * 16;
        repliesContainer.style.marginLeft = `${indentPx}px`;
        repliesContainer.style.marginTop = "8px";
        repliesContainer.style.borderLeft = "2px solid rgba(152,118,142,.25)";
        repliesContainer.style.paddingLeft = "8px";
        children.forEach(child => repliesContainer.appendChild(renderComment(child, allComments, depth + 1)));
        el.appendChild(repliesContainer);
    }

    // COMMENT LIKE / DISLIKE
    const commentLikeBtn    = el.querySelector('.btn-comment-like');
    const commentDislikeBtn = el.querySelector('.btn-comment-dislike');

    showCommentVoteState(comment.ComIdPK, commentLikeBtn, commentDislikeBtn);

    commentLikeBtn.addEventListener('click', async () => {
        await toggleLikesDislikes(comment.ComIdPK, 0, 1);
        showCommentVoteState(comment.ComIdPK, commentLikeBtn, commentDislikeBtn);
    });
    commentDislikeBtn.addEventListener('click', async () => {
        await toggleLikesDislikes(comment.ComIdPK, 0, 0);
        showCommentVoteState(comment.ComIdPK, commentLikeBtn, commentDislikeBtn);
    });

    // REPLY
    el.querySelector('.btn-reply').addEventListener('click', function () {
        const area = el.querySelector('.reply-input-area');
        const commentId = parseInt(this.dataset.commentId);
        const authorName = this.dataset.author;

        if (area.innerHTML !== "") {
            area.innerHTML = "";
            if (_replyToCommentId === commentId) {
                _replyToCommentId = null;
                document.getElementById("newCommentText").placeholder = "Write a comment…";
            }
            return;
        }

        document.querySelectorAll('.reply-input-area').forEach(a => a.innerHTML = "");

        _replyToCommentId = commentId;
        document.getElementById("newCommentText").placeholder = `Replying to @${authorName}…`;
        document.getElementById("newCommentText").focus();

        area.innerHTML = `
            <div class="d-flex gap-2 align-items-center">
                <span class="small text-plum">↩ Replying to @${authorName}</span>
                <button class="btn btn-sm p-0 text-muted cancel-reply" style="font-size:.75rem;">✕ cancel</button>
            </div>`;

        area.querySelector('.cancel-reply').addEventListener('click', () => {
            area.innerHTML = "";
            _replyToCommentId = null;
            document.getElementById("newCommentText").placeholder = "Write a comment…";
        });
    });

    return el;
}

// UTIL

async function getUserInfo(token) {
    try {
        const res = await fetch("/api/userInfo", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
}