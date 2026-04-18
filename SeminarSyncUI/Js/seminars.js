const API_BASE_URL = "http://127.0.0.1:8000/api";
let allSeminars = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchSeminars();
  setupEventListeners();
  initTheme();
});

function setupEventListeners() {
  const searchInput = document.getElementById("seminarSearch");
  const statusFilter = document.getElementById("statusFilter");
  const resetBtn = document.getElementById("resetFilters");
  const tableBody = document.getElementById("seminars-list");

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);

  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "";
    applyFilters();
  });

  tableBody.addEventListener("click", (e) => {
    const target = e.target.closest("button");
    if (!target) return;

    const seminarId = target.dataset.id;
    if (target.title === "Edit") {
      editSeminar(seminarId);
    } else if (target.title === "Delete") {
      deleteSeminar(seminarId);
    }
  });

  // MODAL EVENTS - Now including the Schedule Button!
  document
    .getElementById("addSeminarBtn")
    .addEventListener("click", openAddModal);
  document
    .getElementById("seminarForm")
    .addEventListener("submit", saveSeminar);
  document
    .getElementById("closeModal")
    .addEventListener("click", closeSeminarModal);
  document
    .getElementById("cancelModal")
    .addEventListener("click", closeSeminarModal);
}

async function fetchSeminars() {
  const apiEndpoint = `${API_BASE_URL}/seminars/`;
  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    allSeminars = data;
    renderSeminars(data);
  } catch (error) {
    console.error("Could not fetch seminars:", error);
    document.getElementById("seminars-list").innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-10 text-center text-red-500">
                    Failed to load data. Make sure your Django server is running.
                </td>
            </tr>`;
  }
}

async function deleteSeminar(id) {
  if (confirm("Permanently delete this seminar?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/seminars/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSeminars();
      } else {
        alert("Failed to delete the seminar. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }
}

// OPEN MODAL FOR NEW SEMINAR (This was missing!)
function openAddModal() {
  document.getElementById("seminarForm").reset();
  document.getElementById("seminarId").value = "";
  document.getElementById("modalTitle").textContent = "Schedule Seminar";
  document.getElementById("seminarModal").classList.replace("hidden", "flex");
}

// OPEN MODAL & FILL DATA FOR EXISTING SEMINAR
function editSeminar(id) {
  const seminar = allSeminars.find((s) => s.id == id);
  if (!seminar) return;

  document.getElementById("seminarId").value = seminar.id;
  document.getElementById("formTitle").value = seminar.title;
  document.getElementById("formDescription").value = seminar.description || "";

  if (seminar.date) {
    document.getElementById("formDate").value = seminar.date.split("T")[0];
  }

  document.getElementById("formLocation").value = seminar.location || "";

  document.getElementById("modalTitle").textContent = "Edit Seminar";
  document.getElementById("seminarModal").classList.replace("hidden", "flex");
}

// CLOSE MODAL
function closeSeminarModal() {
  document.getElementById("seminarModal").classList.replace("flex", "hidden");
  document.getElementById("seminarForm").reset();
}

// SAVE DATA TO DJANGO (Updated to handle both Creating and Editing)
async function saveSeminar(event) {
  event.preventDefault();

  const id = document.getElementById("seminarId").value;

  const seminarData = {
    title: document.getElementById("formTitle").value,
    description: document.getElementById("formDescription").value,
    date: document.getElementById("formDate").value,
    location: document.getElementById("formLocation").value,
  };

  // If we have an ID, we PUT (update). If we have no ID, we POST (create new).
  const method = id ? "PUT" : "POST";
  const url = id
    ? `${API_BASE_URL}/seminars/${id}/`
    : `${API_BASE_URL}/seminars/`;

  try {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seminarData),
    });

    if (response.ok) {
      closeSeminarModal();
      fetchSeminars();
    } else {
      console.error("Failed to save.");
      alert("Failed to save changes. Please try again.");
    }
  } catch (error) {
    console.error("Network error:", error);
  }
}

function applyFilters() {
  const searchTerm = document
    .getElementById("seminarSearch")
    .value.toLowerCase();
  const selectedStatus = document.getElementById("statusFilter").value;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = allSeminars.filter((seminar) => {
    const seminarDate = new Date(seminar.date);
    const isUpcoming = seminarDate >= today;
    const matchesSearch =
      seminar.title.toLowerCase().includes(searchTerm) ||
      (seminar.location && seminar.location.toLowerCase().includes(searchTerm));

    let matchesStatus = true;
    if (selectedStatus === "upcoming") matchesStatus = isUpcoming;
    if (selectedStatus === "completed") matchesStatus = !isUpcoming;

    return matchesSearch && matchesStatus;
  });

  renderSeminars(filtered);
}

function renderSeminars(seminars) {
  const tableBody = document.getElementById("seminars-list");
  const countElement = document.getElementById("seminar-count");
  tableBody.innerHTML = "";
  countElement.textContent = seminars.length;

  if (seminars.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-slate-500 italic">No seminars match your criteria.</td></tr>`;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  seminars.forEach((seminar) => {
    const tr = document.createElement("tr");
    tr.className =
      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";

    const seminarDate = new Date(seminar.date);
    const formattedDate = new Date(
      seminarDate.getTime() + Math.abs(seminarDate.getTimezoneOffset() * 60000),
    ).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const isUpcoming = seminarDate >= today;
    const statusBadge = isUpcoming
      ? `<span class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border border-emerald-200 dark:border-emerald-800">Upcoming</span>`
      : `<span class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border border-slate-200 dark:border-slate-700">Completed</span>`;

    tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="font-bold text-slate-800 dark:text-white text-base">${seminar.title}</div>
                <div class="text-xs text-slate-500 dark:text-white/70 mt-1 max-w-md">${seminar.description || ""}</div>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2 font-medium">
                    <span class="material-symbols-outlined text-[16px]">calendar_today</span> ${formattedDate}
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span class="material-symbols-outlined text-[16px]">location_on</span> ${seminar.location || "TBA"}
                </div>
            </td>
            <td class="px-6 py-4">${statusBadge}</td>
            <td class="px-6 py-4 text-right">
                <button data-id="${seminar.id}" class="text-slate-400 hover:text-primary p-2" title="Edit">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button data-id="${seminar.id}" class="text-slate-400 hover:text-red-500 p-2" title="Delete">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </td>`;
    tableBody.appendChild(tr);
  });
}

function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const htmlElement = document.documentElement;

  if (localStorage.getItem("theme") === "dark") {
    htmlElement.classList.add("dark");
  }

  const updateIcon = () => {
    themeIcon.textContent = htmlElement.classList.contains("dark")
      ? "light_mode"
      : "dark_mode";
  };

  updateIcon();

  themeToggle.addEventListener("click", () => {
    htmlElement.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      htmlElement.classList.contains("dark") ? "dark" : "light",
    );
    updateIcon();
  });
}

