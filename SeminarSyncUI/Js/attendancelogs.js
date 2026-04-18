const API_BASE_URL = "http://127.0.0.1:8000/api";
let allAttendanceLogs = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchAttendanceLogs();
  setupEventListeners();
  initTheme();
});

function setupEventListeners() {
  // Filter Elements
  const searchInput = document.getElementById("attendanceSearch");
  const seminarFilter = document.getElementById("seminarFilter");
  const resetBtn = document.getElementById("resetFilters");

  // Modal Elements
  const openModalBtn = document.getElementById("openAddModalBtn");
  const closeModalBtn = document.getElementById("closeAddModalBtn");
  const cancelModalBtn = document.getElementById("cancelAddModalBtn");
  const addModal = document.getElementById("addAttendanceModal");
  const addForm = document.getElementById("addAttendanceForm");

  // Filter Listeners
  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (seminarFilter) seminarFilter.addEventListener("change", applyFilters);
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (seminarFilter) seminarFilter.value = "";
      applyFilters();
    });
  }

  // Modal Listeners
  const closeModal = () => {
    if (addModal) addModal.classList.add("hidden");
    if (addForm) addForm.reset();
  };

  if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
      addModal.classList.remove("hidden");
      populateModalDropdowns();
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);
  if (addForm) addForm.addEventListener("submit", handleAddAttendance);
}

// --- API Calls ---

async function fetchAttendanceLogs() {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance-records/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    allAttendanceLogs = data;
    populateSeminarFilter(data); // Populate the top filter
    renderAttendanceLogs(data);
  } catch (error) {
    console.error("Fetch error:", error);
    const tableBody = document.getElementById("attendance-list");
    if (tableBody)
      tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-red-500">Failed to load records. Check console or ensure Django is running.</td></tr>`;
  }
}

async function populateSeminarFilter() {
  const filter = document.getElementById("seminarFilter");
  if (!filter) return;

  try {
    const response = await fetch(`${API_BASE_URL}/seminars/`);
    const seminars = await response.json();

    filter.innerHTML = '<option value="">Filter by Seminar</option>';
    seminars.forEach((sem) => {
      const option = document.createElement("option");
      option.value = sem.title;
      option.textContent = sem.title;
      filter.appendChild(option);
    });
  } catch (error) {
    console.error("Could not load seminars for filter:", error);
  }
}

async function populateModalDropdowns() {
  const facultySelect = document.getElementById("newAttendanceFaculty");
  const seminarSelect = document.getElementById("newAttendanceSeminar");

  if (!facultySelect || !seminarSelect) return;

  try {
    // Fetch Faculty
    const facultyRes = await fetch(`${API_BASE_URL}/faculty/`);
    const facultyData = await facultyRes.json();

    facultySelect.innerHTML = '<option value="">Select Faculty</option>';
    facultyData.forEach((fac) => {
      facultySelect.innerHTML += `<option value="${fac.id}">${fac.last_name}, ${fac.first_name}</option>`;
    });

    // Fetch Seminars
    const seminarRes = await fetch(`${API_BASE_URL}/seminars/`);
    const seminarData = await seminarRes.json();

    seminarSelect.innerHTML = '<option value="">Select Seminar</option>';
    seminarData.forEach((sem) => {
      seminarSelect.innerHTML += `<option value="${sem.id}">${sem.title}</option>`;
    });
  } catch (error) {
    console.error("Error loading modal dropdown options:", error);
  }
}

async function handleAddAttendance(e) {
  e.preventDefault();

  const facultyId = document.getElementById("newAttendanceFaculty").value;
  const seminarId = document.getElementById("newAttendanceSeminar").value;

  const payload = {
    faculty: facultyId,
    seminar: seminarId,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/attendance-records/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      document.getElementById("addAttendanceModal").classList.add("hidden");
      e.target.reset();
      fetchAttendanceLogs(); // Refresh the table
    } else {
      const errorData = await response.json();
      console.error("Server Error details:", errorData);
      alert("Failed to add record. See console for details.");
    }
  } catch (error) {
    console.error("Network error submitting attendance:", error);
  }
}

async function deleteAttendanceRecord(id) {
  if (!id) return;

  if (confirm("Permanently remove this attendance log?")) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/attendance-records/${id}/`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        fetchAttendanceLogs(); // Refresh table
      } else {
        console.error("Server returned error:", response.status);
        alert(`Error ${response.status}: Could not delete record.`);
      }
    } catch (error) {
      console.error("Network error deleting record:", error);
    }
  }
}

// --- Render & UI Logic ---

function applyFilters() {
  const searchInput = document.getElementById("attendanceSearch");
  const seminarSelect = document.getElementById("seminarFilter");

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const selectedSeminar = seminarSelect ? seminarSelect.value : "";

  const filtered = allAttendanceLogs.filter((log) => {
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

  if (!tableBody) return;

  tableBody.innerHTML = "";
  if (countElement) countElement.textContent = logs.length;

  if (logs.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500 italic">No records found.</td></tr>`;
    return;
  }

  logs.forEach((log) => {
    const tr = document.createElement("tr");
    tr.className =
      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b dark:border-slate-800";

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
          <button onclick="deleteAttendanceRecord(${log.id})" class="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete Record">
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
    if (themeIcon) {
      themeIcon.textContent = htmlElement.classList.contains("dark")
        ? "light_mode"
        : "dark_mode";
    }
  };

  updateIcon();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      htmlElement.classList.toggle("dark");
      localStorage.setItem(
        "theme",
        htmlElement.classList.contains("dark") ? "dark" : "light",
      );
      updateIcon();
    });
  }
}

