document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const formTitle = document.getElementById("formTitle");
  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");
  const message = document.getElementById("message");

  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("active");
    registerForm.classList.add("active");
    formTitle.textContent = "Register";
    message.textContent = "";
  });

  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.remove("active");
    loginForm.classList.add("active");
    formTitle.textContent = "Login";
    message.textContent = "";
  });


  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      message.textContent = "✅ Registered successfully! Please login.";
      registerForm.reset();

      
      registerForm.classList.remove("active");
      loginForm.classList.add("active");
      formTitle.textContent = "Login";
    } else {
      message.textContent = "❌ " + data.message;
    }
  });


  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      window.location.href = "dashboard.html";
    } else {
      message.textContent = "❌ " + data.message;
    }
  });
});

const API_URL = "http://localhost:5000";

async function createEvent(event) {
  event.preventDefault();
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const location = document.getElementById("location").value;
  const category = document.getElementById("category").value;

  const res = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, date, time, location, category })
  });

  const data = await res.json();
  alert(data.message);
  document.getElementById("eventForm").reset();
  loadEvents();
}

async function loadEvents() {
  const keyword = document.getElementById("searchKeyword")?.value || "";
  const category = document.getElementById("filterCategory")?.value || "";
  const date = document.getElementById("filterDate")?.value || "";

  const params = new URLSearchParams({ keyword, category, date });
  const res = await fetch(`${API_URL}/events?${params}`);
  const events = await res.json();

  const list = document.getElementById("eventsList");
  list.innerHTML = "";

  if (events.length === 0) {
    list.innerHTML = "<p>No events found.</p>";
    return;
  }

  events.forEach(e => {
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `
      <h3>${e.title}</h3>
      <p>${e.description || ""}</p>
      <p><b>Date:</b> ${new Date(e.datetime).toLocaleString()}</p>
      <p><b>Location:</b> ${e.location || ""} | <b>Category:</b> ${e.category || ""}</p>
      <div class="actions">
        <button onclick="editEvent('${e._id}', '${e.title}', '${e.description || ""}', '${e.location || ""}', '${e.category || ""}', '${e.datetime}')">Edit</button>
        <button onclick="deleteEvent('${e._id}')">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}


async function deleteEvent(id) {
  if (!confirm("Are you sure you want to delete this event?")) return;
  const res = await fetch(`${API_URL}/events/${id}`, { method: "DELETE" });
  const data = await res.json();
  alert(data.message);
  loadEvents();
}


function editEvent(id, title, description, location, category, datetime) {
  document.getElementById("title").value = title;
  document.getElementById("description").value = description;
  document.getElementById("location").value = location;
  document.getElementById("category").value = category;

  const dt = new Date(datetime);
  document.getElementById("date").value = dt.toISOString().split("T")[0];
  document.getElementById("time").value = dt.toISOString().split("T")[1].slice(0,5);


  const btn = document.querySelector("#eventForm button");
  btn.textContent = "Update Event";
  btn.onclick = (e) => updateEvent(e, id);
}


async function updateEvent(event, id) {
  event.preventDefault();
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const location = document.getElementById("location").value;
  const category = document.getElementById("category").value;

  const res = await fetch(`${API_URL}/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, date, time, location, category })
  });

  const data = await res.json();
  alert(data.message);

  
  document.getElementById("eventForm").reset();
  const btn = document.querySelector("#eventForm button");
  btn.textContent = "Add Event";
  btn.onclick = createEvent;

  loadEvents();
}
document.getElementById("eventForm")?.addEventListener("submit", createEvent);
window.onload = loadEvents;

async function loadEventsViewOnly() {
  const keyword = document.getElementById("searchKeyword")?.value || "";
  const category = document.getElementById("filterCategory")?.value || "";
  const date = document.getElementById("filterDate")?.value || "";

  const params = new URLSearchParams({ keyword, category, date });
  const res = await fetch(`${API_URL}/events?${params}`);
  const events = await res.json();

  const list = document.getElementById("eventsList");
  list.innerHTML = "";

  if (events.length === 0) {
    list.innerHTML = "<p>No events found.</p>";
    return;
  }

  events.forEach(e => {
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `
      <h3>${e.title}</h3>
      <p>${e.description || ""}</p>
      <p><b>Date:</b> ${new Date(e.datetime).toLocaleString()}</p>
      <p><b>Location:</b> ${e.location || ""} | <b>Category:</b> ${e.category || ""}</p>
    `;
    list.appendChild(div);
  });
}
window.addEventListener("load", () => {
  if (window.location.pathname.includes("view")) loadEventsViewOnly();
  else loadEvents();
});
