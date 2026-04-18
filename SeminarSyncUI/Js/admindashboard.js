const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const htmlElement = document.documentElement;

  // 1. Helper function to swap the icon based on the current theme
  const updateIcon = () => {
    if (htmlElement.classList.contains("dark")) {
      themeIcon.textContent = "light_mode"; // Shows a sun icon in dark mode
    } else {
      themeIcon.textContent = "dark_mode"; // Shows a moon icon in light mode
    }
  };

  // 2. Set the initial icon to match what theme-init.js decided
  updateIcon();

  // 3. Listen for the click event
  themeToggle.addEventListener("click", () => {
    // Toggle the 'dark' class on the <html> tag
    htmlElement.classList.toggle("dark");

    // Check if dark mode is currently active after the toggle
    const isDarkMode = htmlElement.classList.contains("dark");

    // Update localStorage so theme-init.js remembers it on reload
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Swap the icon to match the new state
    updateIcon();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Dashboard Data
  loadDashboardStats();
  loadRecentAttendance();
  loadUpcomingSeminars();

  // 2. Refresh Button Logic (Optional extra)
  const refreshBtn = document.querySelector("button[type='button']");
  if (refreshBtn && refreshBtn.innerText === "Refresh Data") {
    refreshBtn.addEventListener("click", () => {
      loadRecentAttendance();
      loadDashboardStats();
    });
  }
});

// Fetch all counts for the top stat cards
async function loadDashboardStats() {
  try {
    const [facultyRes, seminarsRes, deptsRes, attendanceRes] =
      await Promise.all([
        fetch(`${API_BASE_URL}/faculty/`),
        fetch(`${API_BASE_URL}/seminars/`),
        fetch(`${API_BASE_URL}/departments/`),
        fetch(`${API_BASE_URL}/attendance-records/`),
      ]);

    const faculty = await facultyRes.json();
    const seminars = await seminarsRes.json();
    const depts = await deptsRes.json();
    const attendances = await attendanceRes.json();

    // Update the DOM numbers
    document.getElementById("stat-faculty").innerText = faculty.length || 0;
    document.getElementById("stat-seminars").innerText = seminars.length || 0;
    document.getElementById("stat-departments").innerText = depts.length || 0;
    document.getElementById("stat-attendances").innerText =
      attendances.length || 0;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// Fetch and display the table records
async function loadRecentAttendance() {
  const tableBody = document.getElementById("attendance-body");

  try {
    const response = await fetch(`${API_BASE_URL}/attendance-records/`);
    const records = await response.json();

    tableBody.innerHTML = ""; // Clear loading message

    if (!records.length) {
      tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">No attendance records found.</td></tr>`;
      return;
    }

    // Display up to 5 most recent records
    const recentRecords = records.slice(0, 5);

    recentRecords.forEach((record) => {
      const dateLogged = new Date(record.time_logged).toLocaleString();

      tableBody.innerHTML += `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <td class="px-6 py-4 flex items-center gap-3">
            <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              ${record.faculty_last_name.charAt(0)}
            </div>
            <div>
              <p class="font-semibold">${record.faculty_last_name}</p>
              <p class="text-[10px] text-slate-500">ID: ${record.faculty_employee_number}</p>
            </div>
          </td>
          <td class="px-6 py-4 font-medium text-blue-700 dark:text-blue-400">
            ${record.seminar_title}
          </td>
          <td class="px-6 py-4 text-slate-500 text-xs">
            ${dateLogged}
          </td>
          <td class="px-6 py-4 text-right">
            <span class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full text-[10px] font-bold">
              Verified
            </span>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading attendance:", error);
    tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error connecting to Django API.</td></tr>`;
  }
}

// Fetch and display seminars in the side panel
async function loadUpcomingSeminars() {
  const seminarContainer = document.getElementById("upcoming-seminars");

  try {
    const response = await fetch(`${API_BASE_URL}/seminars/`);
    const seminars = await response.json();

    seminarContainer.innerHTML = "";

    if (!seminars.length) {
      seminarContainer.innerHTML = `<p class="text-xs text-slate-500 text-center">No seminars scheduled.</p>`;
      return;
    }

    seminars.forEach((seminar) => {
      const seminarDate = new Date(seminar.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      seminarContainer.innerHTML += `
                <div class="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex gap-3">
                  <span class="material-symbols-outlined text-primary text-xl shrink-0">event</span>
                  <div>
                    <p class="text-xs font-bold text-primary dark:text-blue-400">${seminar.title}</p>
                    <p class="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Location: ${seminar.location || "TBA"}</p>
                    <p class="text-[10px] text-slate-600 dark:text-slate-400 font-bold mt-1">Date: ${seminarDate}</p>
                  </div>
                </div>
            `;
    });
  } catch (error) {
    console.error("Error loading seminars:", error);
    seminarContainer.innerHTML = `<p class="text-xs text-red-500 text-center">Failed to load seminars.</p>`;
  }
}

