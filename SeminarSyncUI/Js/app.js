// Define your backend API URL
const API_BASE_URL = "http://127.0.0.1:8000/api";

// Function to calculate age from birthdate
function calculateAge(birthdateStr) {
  if (!birthdateStr) return "N/A";
  const birthDate = new Date(birthdateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Function to format PSGC codes nicely
function formatPSGC(region, province, city) {
  let location = [];
  if (city) location.push(`City: ${city}`);
  if (province) location.push(`Prov: ${province}`);
  if (region) location.push(`Reg: ${region}`);

  return location.length > 0 ? location.join(" | ") : "No Address Data";
}

// Function to fetch and display Faculty Members
async function fetchFaculty() {
  try {
    const response = await fetch(`${API_BASE_URL}/faculty/`);
    const data = await response.json();

    const table = document.getElementById("faculty-table");
    const tbody = document.getElementById("faculty-body");
    const message = document.getElementById("faculty-message");

    if (data.length === 0) {
      message.innerText = "No faculty records found.";
      return;
    }

    // Hide message and show table
    message.classList.add("hidden");
    table.classList.remove("hidden");

    // Loop through data and create table rows
    data.forEach((faculty) => {
      const age = calculateAge(faculty.birthdate);
      const locationString = formatPSGC(
        faculty.region_code,
        faculty.province_code,
        faculty.city_municipality_code,
      );

      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50 transition-colors text-sm";
      row.innerHTML = `
                <td class="px-4 py-3 border border-gray-200">${faculty.id}</td>
                <td class="px-4 py-3 border border-gray-200 font-medium">${faculty.employee_number}</td>
                <td class="px-4 py-3 border border-gray-200">
                    <span class="font-semibold">${faculty.last_name}</span>, ${faculty.first_name}
                </td>
                <td class="px-4 py-3 border border-gray-200">
                    ${age} yrs <br> <span class="text-xs text-gray-500">${faculty.gender || "N/A"}</span>
                </td>
                <td class="px-4 py-3 border border-gray-200 text-blue-700">
                    ${faculty.department_name}
                </td>
                <td class="px-4 py-3 border border-gray-200 text-xs text-gray-600">
                    ${faculty.street_address ? faculty.street_address + "<br>" : ""}
                    <span class="text-[10px] text-gray-400 font-mono">${locationString}</span>
                </td>
                <td class="px-4 py-3 border border-gray-200">${faculty.email || "N/A"}</td>
            `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching faculty:", error);
    document.getElementById("faculty-message").innerText =
      "Error loading data. Is your Django server running?";
    document
      .getElementById("faculty-message")
      .classList.replace("text-blue-500", "text-red-500");
  }
}

// Function to fetch and display Attendance Records
async function fetchAttendance() {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance-records/`);
    const data = await response.json();

    const table = document.getElementById("attendance-table");
    const tbody = document.getElementById("attendance-body");
    const message = document.getElementById("attendance-message");

    if (data.length === 0) {
      message.innerText = "No attendance records found.";
      return;
    }

    message.classList.add("hidden");
    table.classList.remove("hidden");

    data.forEach((record) => {
      const dateLogged = new Date(record.time_logged).toLocaleString();

      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50 transition-colors text-sm";
      row.innerHTML = `
                <td class="px-4 py-3 border border-gray-200">${record.id}</td>
                <td class="px-4 py-3 border border-gray-200 font-medium">${record.faculty_employee_number}</td>
                <td class="px-4 py-3 border border-gray-200">${record.faculty_last_name}</td>
                <td class="px-4 py-3 border border-gray-200 font-semibold text-blue-700">${record.seminar_title}</td>
                <td class="px-4 py-3 border border-gray-200 text-sm text-gray-500">${dateLogged}</td>
            `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    document.getElementById("attendance-message").innerText =
      "Error loading data. Is your Django server running?";
    document
      .getElementById("attendance-message")
      .classList.replace("text-blue-500", "text-red-500");
  }
}

// Run the functions when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchFaculty();
  fetchAttendance();
});
