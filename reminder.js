const API = "http://localhost:5000";

async function loadEvents() {
  const res = await fetch(`${API}/events`);
  const events = await res.json();
  const container = document.getElementById("eventList");
  container.innerHTML = "";

  events.forEach(event => {
    const eventDate = event.datetime
      ? new Date(event.datetime).toLocaleString()
      : "No date available";

    const card = document.createElement("div");
    card.classList.add("event-card");

    card.innerHTML = `
      <h3>${event.title}</h3>
      <p><b>Date:</b> ${eventDate}</p>

      <textarea id="msg-${event._id}" placeholder="Reminder message..."></textarea>

      <input type="datetime-local" id="rem-${event._id}">

      <button onclick="setReminder('${event._id}')">Set Reminder</button>
    `;

    container.appendChild(card);
  });
}

async function setReminder(eventId) {
  const reminderDate = document.getElementById(`rem-${eventId}`).value;
  const message = document.getElementById(`msg-${eventId}`).value;

  if (!reminderDate) {
    alert("Please select a reminder date & time");
    return;
  }

  const res = await fetch(`${API}/reminders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, reminderDate, message })
  });

  const data = await res.json();
  alert(data.message);

  const timeDiff = new Date(reminderDate) - new Date();

  if (timeDiff > 0) {
    setTimeout(() => {
      triggerBrowserNotification(
        `⏰ ${message || "Your event reminder!"}`
      );
    }, timeDiff);
  }
}

// Ask notification permission when page loads
document.addEventListener("DOMContentLoaded", () => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});

// Show browser notification
function triggerBrowserNotification(message) {
  if (Notification.permission === "granted") {
    new Notification("🔔 Event Reminder", {
      body: message,
      icon: "https://cdn-icons-png.flaticon.com/512/992/992700.png"
    });
  }
}

// Load events
loadEvents();
