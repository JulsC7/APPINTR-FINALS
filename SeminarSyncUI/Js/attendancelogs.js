const API_BASE_URL = "http://127.0.0.1:8000/api";
let allAttendanceLogs = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchAttendanceLogs();
  setupEventListeners();
  initTheme();
});

function setupEventListeners() {
  const searchInput = document.getElementById("attendanceSearch");
  const seminarFilter = document.getElementById("seminarFilter");
  const resetBtn = document.getElementById("resetFilters");
  const tableBody = document.getElementById("attendance-list");

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (seminarFilter) seminarFilter.addEventListener("change", applyFilters);

  resetBtn.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    seminarFilter.value = "";
    applyFilters();
  });

  async function fetchAttendanceLogs() {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance-records/`);
      const data = await response.json();
      allAttendanceLogs = data;

      // We call this without passing 'data' so it can fetch ALL seminars
      populateSeminarFilter();
      renderAttendanceLogs(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }
}

async function fetchAttendanceLogs() {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance-records/`);
    const data = await response.json();
    allAttendanceLogs = data;
    populateSeminarFilter(data);
    renderAttendanceLogs(data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

async function deleteAttendanceRecord(id) {
  if (!id) {
    console.error("Delete failed: No ID provided to the function.");
    return;
  }

  // This will show you the exact URL in the Console tab (F12)
  console.log(
    "Attempting to delete at:",
    `${API_BASE_URL}/attendance-records/${id}/`,
  );

  if (confirm("Permanently remove this attendance log?")) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/attendance-records/${id}/`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        console.log("Delete successful!");
        fetchAttendanceLogs();
      } else {
        console.error("Server returned error:", response.status);
        alert(
          `Error ${response.status}: Django could not find this record at this URL.`,
        );
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }
}

async function populateSeminarFilter() {
  const filter = document.getElementById("seminarFilter");
  if (!filter) return;

  try {
    // Fetch the master list of seminars
    const response = await fetch(`${API_BASE_URL}/seminars/`);
    const seminars = await response.json();

    filter.innerHTML = '<option value="">Filter by Seminar</option>';
    seminars.forEach((sem) => {
      const option = document.createElement("option");
      option.value = sem.title; // Using title to match your filter logic
      option.textContent = sem.title;
      filter.appendChild(option);
    });
  } catch (error) {
    console.error("Could not load seminars for filter:", error);
  }
}

function applyFilters() {
  const searchInput = document.getElementById("attendanceSearch");
  const seminarSelect = document.getElementById("seminarFilter");

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const selectedSeminar = seminarSelect ? seminarSelect.value : "";

  const filtered = allAttendanceLogs.filter((log) => {
    // We use || "" to handle cases where Django might return null
    const lastName = (log.faculty_last_name || "").toLowerCase();
    const empNumber = (log.faculty_employee_number || "").toLowerCase();
    const semTitle = (log.seminar_title || "").toLowerCase();

    const matchesSearch =
      lastName.includes(searchTerm) ||
      empNumber.includes(searchTerm) ||
      semTitle.includes(searchTerm);

    const matchesSeminar =
      selectedSeminar === "" || log.seminar_title === selectedSeminar;

    return matchesSearch && matchesSeminar;
  });

  renderAttendanceLogs(filtered);
}

function renderAttendanceLogs(logs) {
  const tableBody = document.getElementById("attendance-list");
  const countElement = document.getElementById("log-count");

  tableBody.innerHTML = "";
  if (countElement) countElement.textContent = logs.length;

  if (logs.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-slate-500 italic">No records found.</td></tr>`;
    return;
  }

  logs.forEach((log) => {
    const tr = document.createElement("tr");
    tr.className =
      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b dark:border-slate-800";

    // Safety check for date
    const logDate = log.time_logged ? new Date(log.time_logged) : new Date();

    tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="font-bold text-slate-800 dark:text-white">${log.faculty_last_name || "N/A"}</div>
                <div class="text-xs text-slate-500">ID: ${log.faculty_employee_number || "N/A"}</div>
            </td>
            <td class="px-6 py-4 text-sm">${log.seminar_title || "Untitled"}</td>
            <td class="px-6 py-4 text-sm">
                <div>${logDate.toLocaleDateString()}</div>
                <div class="text-xs text-slate-500">${logDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </td>
            <td class="px-6 py-4">
                <span class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-[10px] uppercase font-bold border border-emerald-200 dark:border-emerald-800">Verified</span>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteAttendanceRecord(${log.id})" class="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50" title="Delete Record">
                 <span class="material-symbols-outlined text-lg">delete</span>
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
