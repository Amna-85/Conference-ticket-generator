/* ---------- Elements ---------- */
const form = document.getElementById("ticket-form");
const formView = document.getElementById("form-view");
const ticketView = document.getElementById("ticket-view");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const githubInput = document.getElementById("github");

const avatarInput = document.getElementById("avatar");
const dropzone = document.getElementById("dropzone");
const dropzoneEmpty = document.getElementById("dropzone-empty");
const dropzonePreview = document.getElementById("dropzone-preview");
const avatarPreview = document.getElementById("avatar-preview");
const removeBtn = document.getElementById("remove-avatar");
const changeBtn = document.getElementById("change-avatar");
const avatarHint = document.getElementById("avatar-hint");
const avatarHintText = document.getElementById("avatar-hint-text");

const DEFAULT_HINT = "Upload your photo (JPG or PNG, max size: 500KB).";
const MAX_SIZE = 500 * 1024; // 500KB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

let avatarFile = null;
let avatarURL = "";

/* ---------- Helpers ---------- */
function showError(input, message) {
  const err = document.getElementById(`${input.id}-error`);
  err.querySelector("span").textContent = message;
  err.hidden = false;
  input.setAttribute("aria-invalid", "true");
}

function clearError(input) {
  const err = document.getElementById(`${input.id}-error`);
  err.hidden = true;
  err.querySelector("span").textContent = "";
  input.removeAttribute("aria-invalid");
}

/* ---------- Avatar handling ---------- */
function setAvatarError(message) {
  avatarHintText.textContent = message;
  avatarHint.classList.add("is-error");
  dropzone.classList.add("has-error");
  avatarInput.setAttribute("aria-invalid", "true");
}

function clearAvatarError() {
  avatarHintText.textContent = DEFAULT_HINT;
  avatarHint.classList.remove("is-error");
  dropzone.classList.remove("has-error");
  avatarInput.removeAttribute("aria-invalid");
}

function resetAvatar() {
  if (avatarURL) URL.revokeObjectURL(avatarURL);
  avatarFile = null;
  avatarURL = "";
  avatarInput.value = "";
  avatarPreview.src = "";
  dropzonePreview.hidden = true;
  dropzoneEmpty.hidden = false;
}

function handleFile(file) {
  if (!file) return;

  if (!ALLOWED_TYPES.includes(file.type)) {
    resetAvatar();
    setAvatarError("File type not supported. Please upload a JPG or PNG.");
    return;
  }
  if (file.size > MAX_SIZE) {
    resetAvatar();
    setAvatarError("File too large. Please upload a photo under 500KB.");
    return;
  }

  if (avatarURL) URL.revokeObjectURL(avatarURL);
  avatarFile = file;
  avatarURL = URL.createObjectURL(file);
  avatarPreview.src = avatarURL;
  dropzoneEmpty.hidden = true;
  dropzonePreview.hidden = false;
  clearAvatarError();
  removeBtn.focus();
}

avatarInput.addEventListener("change", () => handleFile(avatarInput.files[0]));
removeBtn.addEventListener("click", () => {
  resetAvatar();
  clearAvatarError();
  avatarInput.focus();
});
changeBtn.addEventListener("click", () => avatarInput.click());

/* Drag & drop */
["dragenter", "dragover"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  })
);
["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
  })
);
dropzone.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));

/* ---------- Validation ---------- */
function validateAvatar() {
  if (!avatarFile) {
    setAvatarError("Please upload your avatar (JPG or PNG, max 500KB).");
    return false;
  }
  return true;
}

function validateName() {
  if (!nameInput.value.trim()) {
    showError(nameInput, "Please enter your full name.");
    return false;
  }
  clearError(nameInput);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!value) {
    showError(emailInput, "Please enter your email address.");
    return false;
  }
  if (!pattern.test(value)) {
    showError(emailInput, "Please enter a valid email address.");
    return false;
  }
  clearError(emailInput);
  return true;
}

function normaliseGithub(value) {
  return value.trim().replace(/^@+/, "");
}

function validateGithub() {
  const user = normaliseGithub(githubInput.value);
  if (!user) {
    showError(githubInput, "Please enter your GitHub username.");
    return false;
  }
  // GitHub usernames: letters, numbers, single hyphens; max 39 chars
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(user)) {
    showError(githubInput, "Use only letters, numbers and hyphens (max 39 characters).");
    return false;
  }
  clearError(githubInput);
  return true;
}

/* Clear errors as the user fixes them */
nameInput.addEventListener("input", () => nameInput.hasAttribute("aria-invalid") && validateName());
emailInput.addEventListener("input", () => emailInput.hasAttribute("aria-invalid") && validateEmail());
githubInput.addEventListener("input", () => githubInput.hasAttribute("aria-invalid") && validateGithub());

/* ---------- Submit ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // run every check so all errors show at once
  const results = [
    [validateAvatar(), avatarInput],
    [validateName(), nameInput],
    [validateEmail(), emailInput],
    [validateGithub(), githubInput],
  ];

  const firstInvalid = results.find(([ok]) => !ok);
  if (firstInvalid) {
    firstInvalid[1].focus();
    return;
  }

  generateTicket();
});

function generateTicket() {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const github = "@" + normaliseGithub(githubInput.value);
  const number = "#" + String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0");

  document.getElementById("t-name-title").textContent = name;
  document.getElementById("t-name").textContent = name;
  document.getElementById("t-email").textContent = email;
  document.getElementById("t-github").textContent = github;
  document.getElementById("t-number").textContent = number;

  const ticketAvatar = document.getElementById("t-avatar");
  ticketAvatar.src = avatarURL;
  ticketAvatar.alt = `${name}'s avatar`;

  formView.hidden = true;
  ticketView.hidden = false;

  const title = document.getElementById("ticket-title");
  title.focus(); // announces the success message to screen readers
  window.scrollTo({ top: 0 });
}