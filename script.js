// variables that allows us to create the login modals for student and vendor.
//this is needed to reuse the same code for both modals and to avoid code duplication.
// allows to change html elements and add event listeners to them for the login functionality.
const studentLoginButton = document.getElementById("studentLoginButton");
const vendorLoginButton = document.getElementById("vendorLoginButton");
const studentModal = document.getElementById("studentModal");
const vendorModal = document.getElementById("vendorModal");
const closeStudentModal = document.getElementById("closeStudentModal");
const closeVendorModal = document.getElementById("closeVendorModal");
const studentLoginForm = document.getElementById("studentLoginForm");
const vendorLoginForm = document.getElementById("vendorLoginForm");
const studentLoginMessage = document.getElementById("studentLoginMessage");
const vendorLoginMessage = document.getElementById("vendorLoginMessage");

// login info for student and vendor
const STUDENT_LOGIN = {
  email: "student@foodfull.com",
  password: "student123"
};

const VENDOR_LOGIN = {
  email: "vendor@foodfull.com",
  password: "vendor123"
};

// functions to open and close the modals by adding or removing the hidden class.
// this is needed to show the login forms when the buttons are clicked and 
// to hide them when the close buttons are clicked.
function openModal(modal) {
  modal.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

// event listeners for the login buttons and close buttons to open and 
// close the modals, and for the login forms to handle the login logic.
studentLoginButton.addEventListener("click", () => {
  studentLoginMessage.textContent = "";
  studentLoginForm.reset();
  openModal(studentModal);
});
// when the vendor login button is clicked, 
// it clears any previous messages, resets the form, and opens the vendor login modal.
vendorLoginButton.addEventListener("click", () => {
  vendorLoginMessage.textContent = "";
  vendorLoginForm.reset();
  openModal(vendorModal);
});
// when the close buttons are clicked, it closes the student or vendor modal.
closeStudentModal.addEventListener("click", () => closeModal(studentModal));
closeVendorModal.addEventListener("click", () => closeModal(vendorModal));



// prevents browser from refreshing the page.
studentLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();

// gets the email and password values from login form, takes of any extra spaces and lowercase email.
  const email = document.getElementById("studentEmail").value.trim().toLowerCase();
  const password = document.getElementById("studentPassword").value.trim();

// checks if the email and password matches the defined login.
//simulates validating the login info and redirects to my account page.
  if (email === STUDENT_LOGIN.email && password === STUDENT_LOGIN.password) {
    studentLoginMessage.textContent = "Login successful. Redirecting...";
    window.setTimeout(() => {
      window.location.href = "./my-account.html";
    }, 500);
    return;
  }

  studentLoginMessage.textContent = "Incorrect student email or password.";
});

// prevents browser from refreshing the page.
vendorLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("vendorEmail").value.trim().toLowerCase();
  const password = document.getElementById("vendorPassword").value.trim();

// checks if the email and password matches the defined login.
//simulates validating the login info and redirects to my manage menu.
  if (email === VENDOR_LOGIN.email && password === VENDOR_LOGIN.password) {
    vendorLoginMessage.textContent = "Login successful. Redirecting...";
    window.setTimeout(() => {
      window.location.href = "./manage-menu.html";
    }, 500);
    return;
  }

  vendorLoginMessage.textContent = "Incorrect vendor email or password.";
});


