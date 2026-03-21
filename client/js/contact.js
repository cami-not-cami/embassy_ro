document.addEventListener("DOMContentLoaded", async () => {
    const grid        = document.getElementById("employeeGrid");
    const loadingState = document.getElementById("loadingState");
    const errorState  = document.getElementById("errorState");

    try {
        const res   = await fetch("/users");
        const users = await res.json();

        // Only show users who are employees (have an EmpIdPK)
        const employees = users.filter(u => u.EmpIdPK != null);

        loadingState.classList.add("d-none");

        if (employees.length === 0) {
            errorState.textContent = "No team members found.";
            errorState.classList.remove("d-none");
            return;
        }

        employees.forEach(emp => renderEmployee(emp, grid));
        grid.classList.remove("d-none");

    } catch (err) {
        console.error("Failed to load employees:", err);
        loadingState.classList.add("d-none");
        errorState.classList.remove("d-none");
    }
});

function renderEmployee(emp, container) {
    const fullName  = `${emp.UserFirstname ?? ""} ${emp.UserLastname ?? ""}`.trim();
    const initials  = [emp.UserFirstname?.[0], emp.UserLastname?.[0]]
        .filter(Boolean).join("").toUpperCase() || "?";
    const jobTitle  = emp.EmpDescription ?? "";
    const phone     = emp.EmpPhonenumber ?? "";
    const email     = emp.UserEmail      ?? "";

    // use a real photo if available, otherwise show initials circle
    const avatarHtml = emp.EmpPhotoPath
        ? `<img src="${emp.EmpPhotoPath}" alt="${fullName}" class="rounded-circle employee-avatar">`
        : `<div class="rounded-circle employee-avatar-placeholder">${initials}</div>`;

    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
        <div class="employee-card text-center p-4 h-100">
            <div class="d-flex justify-content-center mb-3">
                ${avatarHtml}
            </div>
            <h2 class="fw-bold mb-1" style="font-size: 1.75rem;">${fullName}</h2>
            ${jobTitle ? `<p class="text-muted mb-1">${jobTitle}</p>` : ""}
            ${phone    ? `<p class="text-muted mb-1">${phone}</p>`    : ""}
            ${email    ? `<p class="text-muted mb-0">${email}</p>`    : ""}
        </div>
    `;

    container.appendChild(col);
}