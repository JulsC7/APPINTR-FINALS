let allDepartments = [];
let editModeId = null;
const API_URL = "http://127.0.0.1:8000/api/departments/";

document.addEventListener("DOMContentLoaded", () => {
  fetchDepartments();
  setupEventListeners();
  initTheme();
});

function setupEventListeners() {
  document.getElementById("departmentSearch").addEventListener("input", applyFilters);
  document.getElementById("collegeFilter").addEventListener("change", applyFilters);
  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("departmentSearch").value = "";
    document.getElementById("collegeFilter").value = "";
    applyFilters();
  });

  document.getElementById("addDeptBtn").onclick = () => openModal();
  document.getElementById("closeModal").onclick = closeModal;
  document.getElementById("cancelModal").onclick = closeModal;
  document.getElementById("deptForm").onsubmit = handleSave;
}

async function fetchDepartments() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Connection failed");
    allDepartments = await response.json();
    populateDropdowns(allDepartments);
    renderDepartments(allDepartments);
  } catch (error) {
    console.error("Fetch error:", error);
    document.getElementById("departments-list").innerHTML = 
      `<tr><td colspan="3" class="px-6 py-8 text-center text-red-500">Server Error. Make sure Django is running at ${API_URL}</td></tr>`;
  }
}

function populateDropdowns(departments) {
  const filterDropdown = document.getElementById("collegeFilter");
  const modalDropdown = document.getElementById("collegeName");
  const colleges = [...new Set(departments.map(d => d.college_name))].sort();
  
  filterDropdown.innerHTML = '<option value="">All Colleges</option>';
  modalDropdown.innerHTML = '<option value="">Select a College</option><option value="N/A">Non-Academic (N/A)</option>';

  colleges.forEach(c => {
    if(c !== "N/A" && c !== "") {
      const opt = `<option value="${c}">${c}</option>`;
      filterDropdown.innerHTML += opt;
      modalDropdown.innerHTML += opt;
    }
  });
}

async function handleSave(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById("deptName").value,
    college_name: document.getElementById("collegeName").value
  };

  const method = editModeId ? "PUT" : "POST";
  const url = editModeId ? `${API_URL}${editModeId}/` : API_URL;

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal();
      fetchDepartments();
    } else {
        alert("Failed to save. Check your server logs.");
    }
  } catch (err) { console.error("Save error:", err); }
}

// FULLY UPDATED DELETE FUNCTION
async function deleteDept(id) {
  if (!confirm("Are you sure you want to delete this department?")) return;

  // Django REST requires the trailing slash /
  const deleteUrl = `${API_URL}${id}/`;

  try {
    const res = await fetch(deleteUrl, { 
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    if (res.ok) {
      console.log("Delete success");
      fetchDepartments(); // Refresh list
    } else {
      console.error("Delete failed status:", res.status);
      const errorMsg = await res.text();
      console.log("Error details:", errorMsg);
      alert(`Delete failed (Status ${res.status}). Check server console.`);
    }
  } catch (err) {
    console.error("Network/CORS error:", err);
    alert("Network error. Is your Django server running?");
  }
}

function openModal(id = null) {
  editModeId = id;
  const modal = document.getElementById("deptModal");
  const container = document.getElementById("modalContainer");
  
  modal.classList.replace("hidden", "flex");
  setTimeout(() => {
    container.classList.replace("opacity-0", "opacity-100");
    container.classList.replace("scale-95", "scale-100");
  }, 10);

  if (id) {
    const dept = allDepartments.find(d => d.id === id);
    document.getElementById("deptName").value = dept.name;
    document.getElementById("collegeName").value = dept.college_name;
    document.getElementById("modalTitle").innerText = "Edit Department";
  } else {
    document.getElementById("deptForm").reset();
    document.getElementById("modalTitle").innerText = "Add Department";
  }
}

function closeModal() {
  const modal = document.getElementById("deptModal");
  const container = document.getElementById("modalContainer");
  container.classList.replace("opacity-100", "opacity-0");
  container.classList.replace("scale-100", "scale-95");
  setTimeout(() => modal.classList.replace("flex", "hidden"), 200);
}

function renderDepartments(departments) {
  const list = document.getElementById("departments-list");
  document.getElementById("dept-count").textContent = departments.length;
  list.innerHTML = departments.length ? "" : '<tr><td colspan="3" class="px-6 py-8 text-center italic text-slate-500">No records found.</td></tr>';

  departments.forEach(dept => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";
    
    const collegeDisplay = dept.college_name === "N/A" 
      ? `<span class="bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">Non-Academic</span>`
      : `<span class="text-slate-600 dark:text-slate-400 font-medium">${dept.college_name}</span>`;

    tr.innerHTML = `
      <td class="px-6 py-4 font-bold text-slate-800 dark:text-white">${dept.name}</td>
      <td class="px-6 py-4">${collegeDisplay}</td>
      <td class="px-6 py-4 text-right">
        <button onclick="openModal(${dept.id})" class="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10">
          <span class="material-symbols-outlined text-lg">edit</span>
        </button>
        <button onclick="deleteDept(${dept.id})" class="text-slate-400 hover:text-red-500 transition-colors p-2 ml-1 rounded-lg hover:bg-red-500/10">
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      </td>`;
    list.appendChild(tr);
  });
}

function applyFilters() {
  const search = document.getElementById("departmentSearch").value.toLowerCase();
  const college = document.getElementById("collegeFilter").value;
  const filtered = allDepartments.filter(d => 
    d.name.toLowerCase().includes(search) && (college === "" || d.college_name === college)
  );
  renderDepartments(filtered);
}

function initTheme() {
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");
  if (!btn || !icon) return;
  btn.onclick = () => {
    document.documentElement.classList.toggle("dark");
    icon.textContent = document.documentElement.classList.contains("dark") ? "light_mode" : "star";
  };
}
