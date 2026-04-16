const API_BASE_URL = "http://127.0.0.1:8000/api";
let allFaculty = [];

const facultyTableBody = document.getElementById("facultyTableBody");
const facultySummary = document.getElementById("facultySummary");
const facultySearch = document.getElementById("facultySearch");
const departmentFilter = document.getElementById("departmentFilter");
const genderFilter = document.getElementById("genderFilter");
const resetFilters = document.getElementById("resetFilters");

// Helper to get initials for the avatar fallback
function getInitials(firstName = "", lastName = "") {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName.charAt(0).toUpperCase();
  return `${first}${last}`;
}

// Helper to style the gender badge
function getGenderBadge(gender) {
  if (gender === "Male") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  }
  if (gender === "Female") {
    return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
  }
  return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
}

// Helper to calculate age from birthdate
function calculateAge(birthdateStr) {
    if (!birthdateStr) return 'N/A';
    const birthDate = new Date(birthdateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Helper to format the address nicely
function formatAddress(street, cityCode) {
    let location = [];
    if (street) location.push(street);
    if (cityCode) location.push(`City Code: ${cityCode}`);
    return location.length > 0 ? location.join(', ') : 'No Address Data';
}

// Extract distinct departments to populate the dropdown
function populateFilters(facultyData) {
  const departments = [
    ...new Set(facultyData.map((faculty) => faculty.department_name).filter(Boolean)),
  ].sort();
  
  departmentFilter.innerHTML = `<option value="">All Departments</option>`;
  
  departments.forEach((department) => {
    departmentFilter.innerHTML += `<option value="${department}">${department}</option>`;
  });
}

// Render the HTML table rows
function renderFaculty(facultyData) {
  if (!facultyData.length) {
    facultyTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500">
          No faculty records found.
        </td>
      </tr>
    `;
    facultySummary.innerHTML = `Showing <span class="font-semibold">0</span> faculty members`;
    return;
  }

  facultyTableBody.innerHTML = facultyData.map((faculty) => {
      const photoHtml = faculty.photo
        ? `<img src="${faculty.photo}" alt="${faculty.first_name} ${faculty.last_name}" class="size-10 rounded-full bg-slate-100 object-cover" />`
        : `<div class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold tracking-wider">${getInitials(faculty.first_name, faculty.last_name)}</div>`;

      const age = calculateAge(faculty.birthdate);
      const address = formatAddress(faculty.street_address, faculty.city_municipality_code);

      return `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              ${photoHtml}
              <div>
                <p class="font-bold text-slate-900 dark:text-slate-100">
                  ${faculty.last_name}, ${faculty.first_name} ${faculty.middle_initial ? faculty.middle_initial + "." : ""}
                </p>
                <p class="text-xs text-slate-500">ID: ${faculty.employee_number}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm font-semibold text-slate-700 dark:text-slate-200">
              ${faculty.department_name ?? "-"}
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm">
              <p class="text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-slate-400">phone</span>
                ${faculty.phone ?? "N/A"}
              </p>
              <p class="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <span class="material-symbols-outlined text-sm text-slate-400">mail</span>
                ${faculty.email ?? "N/A"}
              </p>
              <p class="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate" title="${address}">
                ${address}
              </p>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="flex flex-col gap-1 items-start">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getGenderBadge(faculty.gender)}">
                ${faculty.gender ?? "Unknown"}
              </span>
              <span class="text-xs text-slate-500">${age} yrs old</span>
            </div>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex justify-end gap-2">
              <button class="p-2 text-slate-400 hover:text-primary transition-colors" title="View Profile">
                <span class="material-symbols-outlined">visibility</span>
              </button>
              <button class="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Edit Record">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete Record">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

  facultySummary.innerHTML = `Showing <span class="font-semibold">${facultyData.length}</span> faculty member${facultyData.length !== 1 ? "s" : ""}`;
}

// Handle search and dropdown filtering
function applyFilters() {
  const searchValue = facultySearch.value.trim().toLowerCase();
  const selectedDepartment = departmentFilter.value;
  const selectedGender = genderFilter.value;

  const filtered = allFaculty.filter((faculty) => {
    const fullName = `${faculty.first_name} ${faculty.last_name} ${faculty.middle_initial ?? ""}`.toLowerCase();
    const empNumber = (faculty.employee_number ?? "").toLowerCase();
    
    const matchesSearch = fullName.includes(searchValue) || empNumber.includes(searchValue);
    const matchesDepartment = !selectedDepartment || faculty.department_name === selectedDepartment;
    const matchesGender = !selectedGender || faculty.gender === selectedGender;
    
    return matchesSearch && matchesDepartment && matchesGender;
  });

  renderFaculty(filtered);
}

// Fetch the data from Django
async function loadFaculty() {
  try {
    const response = await fetch(`${API_BASE_URL}/faculty/`);
    if (!response.ok) throw new Error("Failed to fetch faculty");
    
    allFaculty = await response.json();
    populateFilters(allFaculty);
    renderFaculty(allFaculty);
    
  } catch (error) {
    facultyTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-sm text-red-500">
          Failed to load faculty directory. Ensure your Django server is running.
        </td>
      </tr>
    `;
    facultySummary.innerHTML = `Showing <span class="font-semibold">0</span> faculty members`;
    console.error("Faculty load error:", error);
  }
}

// Event Listeners
facultySearch.addEventListener("input", applyFilters);
departmentFilter.addEventListener("change", applyFilters);
genderFilter.addEventListener("change", applyFilters);

resetFilters.addEventListener("click", () => {
  facultySearch.value = "";
  departmentFilter.value = "";
  genderFilter.value = "";
  renderFaculty(allFaculty);
});

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const htmlElement = document.documentElement;

  // 1. Helper function to swap the icon based on the current theme
  const updateIcon = () => {
    if (htmlElement.classList.contains('dark')) {
      themeIcon.textContent = 'light_mode'; // Shows a sun icon in dark mode
    } else {
      themeIcon.textContent = 'dark_mode';  // Shows a moon icon in light mode
    }
  };

  // 2. Set the initial icon to match what theme-init.js decided
  updateIcon();

  // 3. Listen for the click event
  themeToggle.addEventListener('click', () => {
    // Toggle the 'dark' class on the <html> tag
    htmlElement.classList.toggle('dark');
    
    // Check if dark mode is currently active after the toggle
    const isDarkMode = htmlElement.classList.contains('dark');
    
    // Update localStorage so theme-init.js remembers it on reload
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Swap the icon to match the new state
    updateIcon();
  });
});

// Initialize
loadFaculty();