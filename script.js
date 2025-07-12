// ==== Admin Login Credentials (Hardcoded for demo) ====
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123";

// ==== Dummy Data (For demonstration purposes) ====

// Skills waiting for review
let skills = [
  { id: 1, user: "Alice", skill: "Photoshop", description: "Graphic design basics", status: "pending" },
  { id: 2, user: "Bob", skill: "Python", description: "Intermediate Python programming", status: "pending" },
  { id: 3, user: "Charlie", skill: "Guitar", description: "Basic chords and strumming", status: "pending" }
];

// Users data (including reported users)
let users = [
  { id: 1, name: "Alice", email: "alice@example.com", flags: 0, banned: false },
  { id: 2, name: "Bob", email: "bob@example.com", flags: 3, banned: false },
  { id: 3, name: "Charlie", email: "charlie@example.com", flags: 1, banned: false },
];

// Swaps data
let swaps = [
  { id: 101, skill1: "Photoshop", user1: "Alice", skill2: "Python", user2: "Bob", status: "pending" },
  { id: 102, skill1: "Guitar", user1: "Charlie", skill2: "Photoshop", user2: "Alice", status: "accepted" },
  { id: 103, skill1: "Python", user1: "Bob", skill2: "Guitar", user2: "Charlie", status: "completed" }
];

// Announcements array (to store sent announcements)
let announcements = [];

// ======= Login Functionality =======
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("admin-dashboard").style.display = "block";
    loadAllTabs();
  } else {
    alert("Invalid username or password!");
  }
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    document.getElementById("login-screen").style.display = "block";
    document.getElementById("admin-dashboard").style.display = "none";
    // Clear inputs and reset tabs
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    showSection("review-skills");
    clearStatusMessage();
  }
}

// ======= Tab Navigation =======
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll("section.tab-section").forEach(sec => {
    sec.classList.remove("active");
  });
  // Show target section
  document.getElementById(sectionId).classList.add("active");

  // Update active tab styling
  document.querySelectorAll("nav.tabs a").forEach(tab => {
    tab.classList.remove("active");
  });
  const clickedTab = Array.from(document.querySelectorAll("nav.tabs a")).find(tab => {
    return tab.getAttribute("onclick")?.includes(`showSection('${sectionId}')`);
  });
  if (clickedTab) clickedTab.classList.add("active");
}

// ======= Load all tabs on login =======
function loadAllTabs() {
  renderSkillList();
  renderUserList();
  renderSwapList();
  clearAnnouncementForm();
  clearStatusMessage();
}

// ======= Skill Review Tab =======
function renderSkillList() {
  const container = document.getElementById("skill-list");
  container.innerHTML = "";

  let pendingSkills = skills.filter(skill => skill.status === "pending");

  if (pendingSkills.length === 0) {
    container.innerHTML = "<p>No new skills to review.</p>";
    return;
  }

  pendingSkills.forEach(skill => {
    const div = document.createElement("div");
    div.className = "skill-item";

    div.innerHTML = `
      <strong>${skill.skill}</strong> by <em>${skill.user}</em><br/>
      <p>${skill.description}</p>
      <button class="approve" onclick="approveSkill(${skill.id})">Approve</button>
      <button class="reject" onclick="rejectSkill(${skill.id})">Reject</button>
    `;
    container.appendChild(div);
  });
}

function approveSkill(skillId) {
  let skill = skills.find(s => s.id === skillId);
  if (skill) {
    skill.status = "approved";
    alert(`Skill "${skill.skill}" approved.`);
    renderSkillList();
  }
}

function rejectSkill(skillId) {
  let skill = skills.find(s => s.id === skillId);
  if (skill) {
    skill.status = "rejected";
    alert(`Skill "${skill.skill}" rejected.`);
    renderSkillList();
  }
}

// ======= Ban Users Tab =======
function renderUserList() {
  const tbody = document.getElementById("user-list");
  tbody.innerHTML = "";

  users.forEach(user => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.flags}</td>
      <td>
        ${user.banned 
          ? `<button disabled style="opacity:0.6;cursor:not-allowed;">Banned</button>` 
          : `<button onclick="banUser(${user.id})" style="background:#e74c3c;color:#fff;padding:6px 12px;border:none;border-radius:6px;cursor:pointer;">Ban</button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function banUser(userId) {
  let user = users.find(u => u.id === userId);
  if (!user) return;
  if (confirm(`Ban user "${user.name}"?`)) {
    user.banned = true;
    alert(`User "${user.name}" has been banned.`);
    renderUserList();
  }
}

// ======= Monitor Swaps Tab =======
function renderSwapList(filterStatus = "pending") {
  const container = document.getElementById("swap-list");
  container.innerHTML = "";

  let filteredSwaps = swaps;
  if (filterStatus !== "all") {
    filteredSwaps = swaps.filter(s => s.status === filterStatus);
  }

  if (filteredSwaps.length === 0) {
    container.innerHTML = "<p>No swaps found for this status.</p>";
    return;
  }

  filteredSwaps.forEach(swap => {
    const div = document.createElement("div");
    div.className = "skill-item";
    div.style.borderLeft = "5px solid #ffd700";

    div.innerHTML = `
      <strong>${swap.user1}</strong> offers <em>${swap.skill1}</em> &nbsp;⇄&nbsp; <strong>${swap.user2}</strong> offers <em>${swap.skill2}</em><br/>
      <small>Status: <span class="status ${swap.status}">${swap.status}</span></small><br/>
      ${swap.status === "pending" 
        ? `<button onclick="updateSwapStatus(${swap.id}, 'accepted')" class="approve">Accept</button>
           <button onclick="updateSwapStatus(${swap.id}, 'cancelled')" class="reject">Cancel</button>`
        : ""
      }
    `;
    container.appendChild(div);
  });
}

function filterSwaps() {
  const select = document.getElementById("swap-filter");
  renderSwapList(select.value);
}

function updateSwapStatus(swapId, newStatus) {
  let swap = swaps.find(s => s.id === swapId);
  if (!swap) return;

  swap.status = newStatus;
  alert(`Swap #${swapId} status updated to "${newStatus}".`);
  renderSwapList(document.getElementById("swap-filter").value);
}

// ======= Send Announcement Tab =======
function sendAnnouncement() {
  const titleInput = document.getElementById("announce-title");
  const messageInput = document.getElementById("announce-message");
  const timeInput = document.getElementById("announce-time");
  const statusP = document.getElementById("announce-status");

  const title = titleInput.value.trim();
  const message = messageInput.value.trim();
  const time = timeInput.value;

  if (!title || !message) {
    statusP.style.color = "#e74c3c";
    statusP.textContent = "Please enter both title and message.";
    return;
  }

  const announcement = {
    id: announcements.length + 1,
    title,
    message,
    time: time ? new Date(time) : new Date(),
    sent: false
  };

  // If scheduled for future
  if (time && new Date(time) > new Date()) {
    const delay = new Date(time) - new Date();
    statusP.style.color = "#f39c12";
    statusP.textContent = `Announcement scheduled for ${new Date(time).toLocaleString()}.`;
    setTimeout(() => {
      announcement.sent = true;
      alert(`Scheduled Announcement: ${title}\n\n${message}`);
      clearAnnouncementForm();
      statusP.textContent = "";
    }, delay);
  } else {
    announcement.sent = true;
    alert(`Announcement Sent!\n\nTitle: ${title}\nMessage: ${message}`);
    clearAnnouncementForm();
    statusP.textContent = "";
  }

  announcements.push(announcement);
}

function clearAnnouncementForm() {
  document.getElementById("announce-title").value = "";
  document.getElementById("announce-message").value = "";
  document.getElementById("announce-time").value = "";
}

function clearStatusMessage() {
  document.getElementById("announce-status").textContent = "";
}

// ======= Download Reports Tab =======
function downloadCSV(filename, rows) {
  const processRow = row => {
    return row.map(val => {
      let innerValue = val === null || val === undefined ? "" : val.toString();
      if (val instanceof Date) {
        innerValue = val.toLocaleString();
      }
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) {
        result = `"${result}"`;
      }
      return result;
    }).join(",");
  };

  let csvContent = rows.map(processRow).join("\n");
  let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadUserActivity() {
  // For demo, just export user data with flags and ban status
  let rows = [
    ["User ID", "Name", "Email", "Reported Flags", "Banned"]
  ];
  users.forEach(u => {
    rows.push([u.id, u.name, u.email, u.flags, u.banned ? "Yes" : "No"]);
  });
  downloadCSV("user_activity_log.csv", rows);
}

function downloadSwapStats() {
  // Export swaps data
  let rows = [
    ["Swap ID", "User 1", "Skill 1", "User 2", "Skill 2", "Status"]
  ];
  swaps.forEach(s => {
    rows.push([s.id, s.user1, s.skill1, s.user2, s.skill2, s.status]);
  });
  downloadCSV("swap_stats.csv", rows);
}

function downloadFeedbackData() {
  // Since no real feedback, create dummy feedback data
  let feedbacks = [
    { id: 1, user: "Alice", feedback: "Great platform!", date: new Date("2025-07-01") },
    { id: 2, user: "Bob", feedback: "Could improve the UI.", date: new Date("2025-07-02") }
  ];

  let rows = [
    ["Feedback ID", "User", "Feedback", "Date"]
  ];
  feedbacks.forEach(fb => {
    rows.push([fb.id, fb.user, fb.feedback, fb.date]);
  });
  downloadCSV("feedback_data.csv", rows);
}
// 🎤 Voice-to-Text for Announcement
function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function (event) {
    const voiceText = event.results[0][0].transcript;
    document.getElementById("announce-message").value = voiceText;
    speakAnnouncement(voiceText);  // Optional: speak immediately
  };

  recognition.onerror = function (event) {
    alert("Voice input failed: " + event.error);
  };
}

// 🔊 Text-to-Speech
function speakAnnouncement(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}
