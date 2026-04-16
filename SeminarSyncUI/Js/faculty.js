const API_BASE_URL = "http://127.0.0.1:8000/api";
let allFaculty = [];
let allDepartments = [];
let editFacId = null;


const facultyTableBody = document.getElementById("facultyTableBody");
const facultySummary = document.getElementById("facultySummary");
const facultySearch = document.getElementById("facultySearch");
const departmentFilter = document.getElementById("departmentFilter");
const genderFilter = document.getElementById("genderFilter");
const resetFilters = document.getElementById("resetFilters");
const facultyModal = document.getElementById("facultyModal");
const modalContainer = document.getElementById("modalContainer");
const facultyForm = document.getElementById("facultyForm");


// HELPERS
function getInitials(f, l) { return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase(); }
function getGenderBadge(g) {
 if (g === "Male") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
 if (g === "Female") return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
 return "bg-slate-100 text-slate-800";
}


// FETCH DEPARTMENTS
async function loadDepartments() {
   try {
       const res = await fetch(`${API_BASE_URL}/departments/`);
       allDepartments = await res.json();
      
       // Populate Filter Dropdown
       departmentFilter.innerHTML = '<option value="">All Departments</option>' +
           allDepartments.map(d => `<option value="${d.name}">${d.name}</option>`).join("");


       // Populate Modal Dropdown
       document.getElementById("facDept").innerHTML = allDepartments.map(d =>
           `<option value="${d.id}">${d.name}</option>`
       ).join("");
   } catch(e) { console.error("Dept load error", e); }
}


// RENDER TABLE
function renderFaculty(data) {
   if (!data.length) {
       facultyTableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500">No records found.</td></tr>';
       return;
   }
   facultyTableBody.innerHTML = data.map(f => {
       const photoHtml = f.photo
           ? `<img src="${f.photo}" class="size-10 rounded-full border border-slate-200 object-cover" />`
           : `<div class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">${getInitials(f.first_name, f.last_name)}</div>`;


       return `
           <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
               <td class="px-6 py-4">
                   <div class="flex items-center gap-3">
                       ${photoHtml}
                       <div>
                           <p class="font-bold text-slate-900 dark:text-slate-100">${f.last_name}, ${f.first_name}</p>
                           <p class="text-xs text-slate-500">ID: ${f.employee_number}</p>
                       </div>
                   </div>
               </td>
               <td class="px-6 py-4 text-sm font-semibold">${f.department_name || "-"}</td>
               <td class="px-6 py-4 text-xs text-slate-500">${f.email}</td>
               <td class="px-6 py-4">
                   <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getGenderBadge(f.gender)}">${f.gender}</span>
               </td>
               <td class="px-6 py-4 text-right">
                   <button onclick="openFacModal(${f.id})" class="p-2 text-slate-400 hover:text-blue-500 transition-colors"><span class="material-symbols-outlined">edit</span></button>
                   <button onclick="deleteFac(${f.id})" class="p-2 text-slate-400 hover:text-red-500 transition-colors"><span class="material-symbols-outlined">delete</span></button>
               </td>
           </tr>`;
   }).join("");
   facultySummary.innerHTML = `Showing <span class="font-semibold">${data.length}</span> faculty members`;
}


// MODAL LOGIC
function openFacModal(id = null) {
   editFacId = id;
   facultyModal.classList.replace("hidden", "flex");
   setTimeout(() => modalContainer.classList.replace("opacity-0", "opacity-100"), 10);
   setTimeout(() => modalContainer.classList.replace("scale-95", "scale-100"), 10);


   if (id) {
       document.getElementById("modalTitle").textContent = "Edit Faculty Record";
       const f = allFaculty.find(x => x.id === id);
       document.getElementById("facEmpNum").value = f.employee_number;
       document.getElementById("facFirstName").value = f.first_name;
       document.getElementById("facLastName").value = f.last_name;
       document.getElementById("facEmail").value = f.email;
       document.getElementById("facGender").value = f.gender;
       const dept = allDepartments.find(d => d.name === f.department_name);
       if(dept) document.getElementById("facDept").value = dept.id;
   } else {
       document.getElementById("modalTitle").textContent = "Add Faculty Member";
       facultyForm.reset();
   }
}


function closeFacModal() {
   modalContainer.classList.replace("scale-100", "scale-95");
   modalContainer.classList.replace("opacity-100", "opacity-0");
   setTimeout(() => facultyModal.classList.replace("flex", "hidden"), 200);
}


// CRUD ACTIONS
facultyForm.onsubmit = async (e) => {
   e.preventDefault();
   const formData = new FormData();
   formData.append("employee_number", document.getElementById("facEmpNum").value);
   formData.append("first_name", document.getElementById("facFirstName").value);
   formData.append("last_name", document.getElementById("facLastName").value);
   formData.append("email", document.getElementById("facEmail").value);
   formData.append("gender", document.getElementById("facGender").value);
   formData.append("department", document.getElementById("facDept").value);
  
   const file = document.getElementById("facPhoto").files[0];
   if(file) formData.append("photo", file);


   const method = editFacId ? "PUT" : "POST";
   const url = editFacId ? `${API_BASE_URL}/faculty/${editFacId}/` : `${API_BASE_URL}/faculty/`;


   await fetch(url, { method, body: formData });
   closeFacModal();
   loadFaculty();
};


async function deleteFac(id) {
   if (confirm("Permanently delete this faculty member?")) {
       await fetch(`${API_BASE_URL}/faculty/${id}/`, { method: "DELETE" });
       loadFaculty();
   }
}


// FILTERING LOGIC
function applyFilters() {
 const searchTerm = facultySearch.value.toLowerCase();
 const deptTerm = departmentFilter.value;
 const genderTerm = genderFilter.value;


 const filtered = allFaculty.filter(f => {
   const matchesSearch = f.first_name.toLowerCase().includes(searchTerm) ||
                         f.last_name.toLowerCase().includes(searchTerm) ||
                         f.employee_number.toLowerCase().includes(searchTerm);
   const matchesDept = !deptTerm || f.department_name === deptTerm;
   const matchesGender = !genderTerm || f.gender === genderTerm;
   return matchesSearch && matchesDept && matchesGender;
 });
 renderFaculty(filtered);
}


async function loadFaculty() {
   try {
       const res = await fetch(`${API_BASE_URL}/faculty/`);
       allFaculty = await res.json();
       renderFaculty(allFaculty);
   } catch(e) { console.error("Load failed", e); }
}


// EVENT LISTENERS
facultySearch.addEventListener("input", applyFilters);
departmentFilter.addEventListener("change", applyFilters);
genderFilter.addEventListener("change", applyFilters);
resetFilters.addEventListener("click", () => {
   facultySearch.value = "";
   departmentFilter.value = "";
   genderFilter.value = "";
   renderFaculty(allFaculty);
});


document.addEventListener("DOMContentLoaded", () => {
   loadDepartments();
   loadFaculty();
   document.getElementById("addFacultyBtn").onclick = () => openFacModal();
   document.getElementById("closeModal").onclick = closeFacModal;
   document.getElementById("cancelModal").onclick = closeFacModal;
});

