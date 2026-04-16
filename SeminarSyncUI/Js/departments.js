// 1. Global state to hold data
let allDepartments = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchDepartments();
  setupEventListeners();
  initTheme();
});

function setupEventListeners() {
  const searchInput = document.getElementById("departmentSearch");
  const collegeFilter = document.getElementById("collegeFilter");
  const resetBtn = document.getElementById("resetFilters");

  // Filter as you type
  searchInput.addEventListener("input", applyFilters);
  
  // Filter when dropdown changes
  collegeFilter.addEventListener("change", applyFilters);

  // Reset logic
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    collegeFilter.value = "";
    applyFilters();
  });
}

async function fetchDepartments() {
  const apiEndpoint = "http://127.0.0.1:8000/api/departments/";
  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    allDepartments = data; // Store the master list
    
    populateCollegeFilter(data);
    renderDepartments(data);
  } catch (error) {
    console.error("Could not fetch departments:", error);
    document.getElementById("departments-list").innerHTML = `
      <tr>
        <td colspan="3" class="px-6 py-8 text-center text-red-500">
          Failed to load data. Make sure your Django server is running.
        </td>
      </tr>`;
  }
}

// Dynamically fill the dropdown based on unique colleges in the data
function populateCollegeFilter(departments) {
  const filter = document.getElementById("collegeFilter");
  const colleges = [...new Set(departments.map(d => d.college_name))].sort();
  
  colleges.forEach(college => {
    if(college !== "N/A") {
      const option = document.createElement("option");
      option.value = college;
      option.textContent = college;
      filter.appendChild(option);
    }
  });
}

function applyFilters() {
  const searchTerm = document.getElementById("departmentSearch").value.toLowerCase();
  const selectedCollege = document.getElementById("collegeFilter").value;

  const filtered = allDepartments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm);
    const matchesCollege = selectedCollege === "" || dept.college_name === selectedCollege;
    return matchesSearch && matchesCollege;
  });

  renderDepartments(filtered);
}

function renderDepartments(departments) {
  const tableBody = document.getElementById("departments-list");
  const countDisplay = document.getElementById("dept-count");
  
  tableBody.innerHTML = "";
  countDisplay.textContent = departments.length; // Update the summary count

  if (departments.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="px-6 py-8 text-center text-slate-500 italic">
          No matching departments found.
        </td>
      </tr>`;
    return;
  }

  departments.forEach((dept) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";

    const collegeBadge = dept.college_name === "N/A"
      ? `<span class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">Non-Academic</span>`
      : `<span class="text-slate-600 dark:text-slate-400">${dept.college_name}</span>`;

    tr.innerHTML = `
      <td class="px-6 py-4 font-bold text-slate-800 dark:text-white">${dept.name}</td>
      <td class="px-6 py-4">${collegeBadge}</td>
      <td class="px-6 py-4 text-right">
        <button class="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10" title="Edit">
          <span class="material-symbols-outlined text-lg">edit</span>
        </button>
        <button class="text-slate-400 hover:text-red-500 transition-colors p-2 ml-1 rounded-lg hover:bg-red-500/10" title="Delete">
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      </td>`;
    tableBody.appendChild(tr);
  });
}

// Theme management wrapped in a function
function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const htmlElement = document.documentElement;

  const updateIcon = () => {
    themeIcon.textContent = htmlElement.classList.contains("dark") ? "light_mode" : "dark_mode";
  };

  updateIcon();

  themeToggle.addEventListener("click", () => {
    htmlElement.classList.toggle("dark");
    const isDarkMode = htmlElement.classList.contains("dark");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    updateIcon();
  });
}
