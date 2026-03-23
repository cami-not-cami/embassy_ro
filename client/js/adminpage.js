//import {Chart} from "chart.js";

document.addEventListener("DOMContentLoaded",  async () => {
const tableBody = document.getElementById("tableBody");
tableBody.innerHTML = "";
let currentUser = null;

const res = await fetch('/users');
const users = await res.json();
users.forEach((user, index) => renderUsers(user, index));

function renderUsers(user, index) {
    const row = tableBody.insertRow();

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
     <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#modalDelete" data-user-id="${user.UserIdPK}">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
        </svg>
      </button>
      <button class="btn btn-primary" id="btnModelPromote" href="#modalPromote" data-bs-target="#modalPromote" data-bs-toggle="modal" data-user-id="${user.UserIdPK}">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z"/>
        </svg>
      </button>
      <button class="btn btn-info" id="btnModelDemote" href="#modalDemote" data-bs-target="#modalDemote" data-bs-toggle="modal" data-user-id="${user.UserIdPK}">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z"/>
        </svg>
      </button>
    </td>`;

    //const promoteBtn = row.querySelector('.btn-primary');
    //promoteBtn.addEventListener('click', () => openEditModal(user));

    const editBtn = row.querySelector('.btn-success');
    editBtn.addEventListener('click', () => openEditModal(user));

    const deleteBtn = row.querySelector('.btn-danger');
    deleteBtn.addEventListener('click', () => currentUser = user);

    const promoteBtn = row.querySelector('.btn-primary');
    promoteBtn.addEventListener('click', () => currentUser = user);

    const demoteBtn = row.querySelector('.btn-info');
    demoteBtn.addEventListener('click', () => currentUser = user);
}

    document.getElementById('btnDeleteUser').addEventListener('click', async () => {
        console.log(currentUser.UserIdPK)
        const token = localStorage.getItem("token");
        const res = await fetch(`/user/${currentUser.UserIdPK}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }

        });
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('modalDelete')).hide();
            tableBody.innerHTML = "";
            const updated = await (await fetch('/users')).json();
            updated.forEach((user, index) => renderUsers(user, index));
        }
    });


//PROMOTE HERE
//STATISTIC HERE

        const btnPromote = document.getElementById('btnPromote');

    btnPromote.addEventListener('click', async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to vote.");
            return;
        }

        const res1 = await fetch('/createEmployee', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                empPhoneNumber: "-",
                EmpIsAdmin: 0,
                EmpDescription: "-"
            })
        });

        const data = await res1.json();
        console.log(data.id);

        const res = await fetch(`/editUser/${currentUser.UserIdPK}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                userIDPK: currentUser.UserIdPK,
                employeeFK: data.id,
                firstname: currentUser.UserFirstname,
                lastname:  currentUser.UserLastname,
                email:     currentUser.UserEmail,
            })
        });
    });
const btnDemote = document.getElementById('btnDemote');

btnDemote.addEventListener('click', async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to vote.");
        return;
    }

    const res = await fetch(`/editUser/${currentUser.UserIdPK}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            employeeFK: null,
            firstname: currentUser.UserFirstname,
            lastname:  currentUser.UserLastname,
            email:     currentUser.UserEmail,
        })
    });


})

async function getEmployeeStatistics(){
    const employeeStatistic = document.getElementById('employeeStatistic');

    //GET ALL USERS

    const labels =  ["Admin", "Visitor", "Employee"];
    const data = {
        labels: labels,
        datasets: [{
            label: 'Employee Statistic',
            //data:
        }]
    }
    new Chart(employeeStatistic, {
        type: 'bar'
    })
}


const formEditUser = document.getElementById('formEditUser');
formEditUser.addEventListener('submit', async event => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    const res = await fetch(`/editUser/${currentUser.UserIdPK}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
            userIDPK: currentUser.UserIdPK,
            employeeFK: currentUser.EmpIdPK,
            firstname: document.getElementById('inputEditFirstname').value,
            lastname:  document.getElementById('inputEditLastname').value,
            email:     document.getElementById('inputEditEmail').value,
        })
    });

    console.log(currentUser.UserIdPK);

    if (currentUser.EmpIdPK) {
        const res1 = await fetch("/editEmployee", {
            method: "PUT",
            headers,
            body: JSON.stringify({
                EmpIdPK: currentUser.EmpIdPK,
                empPhoneNumber: document.getElementById('inputEditTelephone').value,
                EmpIsAdmin: 0,
                EmpDescription: document.getElementById('inputEditDescription').value,
            })
        });
    }

    if (res.ok && res.ok === true) {
        bootstrap.Modal.getInstance(document.getElementById('modalEdit')).hide();
        tableBody.innerHTML = "";
        const updated = await (await fetch('/users')).json();
        updated.forEach((user, index) => renderUsers(user, index));
    }
});


function openEditModal(user) {
    currentUser = user;
    document.getElementById('inputEditFirstname').value  = user.UserFirstname  || '';
    document.getElementById('inputEditLastname').value   = user.UserLastname   || '';
    document.getElementById('inputEditEmail').value      = user.UserEmail      || '';
    document.getElementById('inputEditDescription').value = user.EmpDescription|| '';
    console.log("IN openEditModal");
    console.log(user);
}

})
