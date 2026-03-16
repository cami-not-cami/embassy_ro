
document.addEventListener("DOMContentLoaded", async function () {


    document.getElementById("btnSignUp").addEventListener("click", createUser)
})
 async function createUser() {
     let  firstname= document.getElementById("inputFirstName").value
     let lastname= document.getElementById("inputLastName").value
     let email=  document.getElementById("inputSignupEmail").value
     let password=  document.getElementById("inputSignupPassword").value
     let confirmPassword=  document.getElementById("inputSignupConfirmPassword").value
     if(password !== confirmPassword) {
         alert("Passwords do not match")
     }
     else if(password === confirmPassword) {
         const res = await fetch('/users', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 firstname: document.getElementById("inputFirstName").value,
                 lastname: document.getElementById("inputLastName").value,
                 email:  document.getElementById("inputSignupEmail").value,
                 password:  document.getElementById("inputSignupPassword").value,

             })
         });
     }




}