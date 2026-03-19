const tableBody = document.getElementById("tableBody");
tableBody.innerHTML = "";

const res = await fetch('/users');
const users = await res.json();
users.forEach((user, index) => renderUsers(user, index));

function renderUsers(user, index) {
    const row = tableBody.insertRow();
    console.log(user);
    row.innerHTML = `
    <th scope="row" class="text-black">${index}</th>
    <td class="text-black">${user.UserFirstname  || '-'}</td>
    <td class="text-black">${user.UserLastname  || '-'}</td>
    <td class="text-black">${user.UserEmail  || '-'}</td>
    
    <td>
      <button class="btn btn-success" href="#modalEdit" data-bs-target="#modalEdit" data-bs-toggle="modal" data-user-id="${user.UserIdPK}">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
          <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
        </svg>
      </button>
      <button class="btn btn-danger" href="#modalDelete" data-bs-target="#modalDelete" data-user-id="${user.UserIdPK}">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
        </svg>
      </button>
      <button class="btn btn-primary" href="#modalPromote" data-bs-target="#modalPromote" data-user-id="${user.UserIdPK}">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z"/>
        </svg>
      </button>
    </td>`;

    const promoteBtn = row.querySelector('.btn-primary');
    promoteBtn.addEventListener('click', () => openEditModal(user));

    const editBtn = row.querySelector('.btn-success');
    editBtn.addEventListener('click', () => openEditModal(user));


}

const formEditUser = document.getElementById('formEditUser');






// Fix: rename openEditModal to match what you called in the event listener
function openEditModal(user) {
    document.getElementById('inputEditFirstname').value  = user.UserFirstname  || '';
    document.getElementById('inputEditLastname').value   = user.UserLastname   || '';
    document.getElementById('inputEditEmail').value      = user.UserEmail      || '';
    document.getElementById('inputEditDescription').value = user.EmpDescription|| '';

    console.log("IN openEditModal");
    console.log(user);

    formEditUser.addEventListener('submit', async event => {
        const inputEditFirstName = document.getElementById('inputEditFirstName').value;
        const inputEditLastname = document.getElementById('inputEditLastname').value;
        const inputEditEmail = document.getElementById('inputEditEmail').value;
        const inputEditTelephone = document.getElementById('inputEditTelephone').value;
        const inputEditDescription = document.getElementById('inputEditDescription').value;

        console.log("IN FORM EDIT USER");

        const res = await fetch("/editUser",{
            method: "PUT",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstname: inputEditFirstName,
                lastname: inputEditLastname,
                email: inputEditEmail,
                employeeFK: user.UserEmpFK,
                userIDPK: user.UserIDPK,
            })
        })

        const res1 = await fetch("/editEmployee",{
            method: "PUT",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                empPhoneNumber: inputEditTelephone,
                EmpDescription: inputEditDescription,
                EmpIdPK: user.UserEmpFK,
            })
        })

    })
}

async function editUser() {
    const payload = {
        userIDPK:   users.dataset.userid,
        firstname:   document.getElementById('inputEditFirstname').value,
        lastname:    document.getElementById('inputEditLastname').value,
        email:       document.getElementById('editEmail').value,
    };

    const res = await fetch('/editUser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalEdit')).hide();
        // Reload the table
        tableBody.innerHTML = "";
        const users = await (await fetch('/users')).json();
        users.forEach((user, index) => renderUsers(user, index));
    } else {
        const err = await res.json();
        alert('Error: ' + err.error);
    }
}



