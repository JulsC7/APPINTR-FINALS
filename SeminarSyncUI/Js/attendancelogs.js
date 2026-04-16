let allAttendanceLogs = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchAttendanceLogs();
    setupEventListeners();
    initTheme();
});

function setupEventListeners() {
    const searchInput = document.getElementById('attendanceSearch');
    const seminarFilter = document.getElementById('seminarFilter');
    const resetBtn = document.getElementById('resetFilters');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (seminarFilter) seminarFilter.addEventListener('change', applyFilters);

    // Reset logic
    resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        seminarFilter.value = '';
        applyFilters();
    });
}

async function fetchAttendanceLogs() {
    const apiEndpoint = 'http://127.0.0.1:8000/api/attendance-records/'; 

    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        allAttendanceLogs = data; // Store master list
        
        populateSeminarFilter(data);
        renderAttendanceLogs(data);
        
    } catch (error) {
        console.error("Could not fetch attendance logs:", error);
        document.getElementById('attendance-list').innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-10 text-center text-red-500">
                    Failed to load data. Make sure your Django server is running.
                </td>
            </tr>`;
    }
}

function populateSeminarFilter(logs) {
    const filter = document.getElementById('seminarFilter');
    // Get unique seminar titles and sort them
    const seminars = [...new Set(logs.map(log => log.seminar_title))].sort();
    
    seminars.forEach(title => {
        if (title) {
            const option = document.createElement('option');
            option.value = title;
            option.textContent = title;
            filter.appendChild(option);
        }
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('attendanceSearch')?.value.toLowerCase() || '';
    const selectedSeminar = document.getElementById('seminarFilter').value;

    const filtered = allAttendanceLogs.filter(log => {
        // Search across Faculty Name, Employee Number, and Seminar Title
        const matchesSearch = 
            (log.faculty_last_name && log.faculty_last_name.toLowerCase().includes(searchTerm)) ||
            (log.faculty_employee_number && log.faculty_employee_number.toLowerCase().includes(searchTerm)) ||
            (log.seminar_title && log.seminar_title.toLowerCase().includes(searchTerm));

        const matchesSeminar = selectedSeminar === "" || log.seminar_title === selectedSeminar;

        return matchesSearch && matchesSeminar;
    });

    renderAttendanceLogs(filtered);
}

function renderAttendanceLogs(logs) {
    const tableBody = document.getElementById('attendance-list');
    const countElement = document.getElementById('log-count');
    
    tableBody.innerHTML = ''; 
    countElement.textContent = logs.length;

    if (logs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-10 text-center text-slate-500 italic">
                    No matching attendance records found.
                </td>
            </tr>`;
        return;
    }

    logs.forEach(log => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";
        
        const logDate = new Date(log.time_logged);
        const formattedDate = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = logDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        const statusBadge = `<span class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border border-emerald-200 dark:border-emerald-800 flex items-center w-fit gap-1"><span class="material-symbols-outlined text-[12px]">check_circle</span> Verified</span>`;

        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden text-primary font-bold text-xs">
                        ${log.faculty_last_name ? log.faculty_last_name.charAt(0) : '?'}
                    </div>
                    <div>
                        <div class="font-bold text-slate-800 dark:text-white">${log.faculty_last_name || 'Unknown'}</div>
                        <div class="text-xs text-slate-500 mt-0.5">ID: ${log.faculty_employee_number || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-slate-700 dark:text-slate-300">${log.seminar_title || 'Unnamed Seminar'}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-slate-700 dark:text-slate-300">${formattedDate}</div>
                <div class="text-xs text-slate-500 mt-0.5">${formattedTime}</div>
            </td>
            <td class="px-6 py-4">${statusBadge}</td>
            <td class="px-6 py-4 text-right">
                <button class="text-slate-400 hover:text-red-500 transition-colors p-2 ml-1 rounded-lg hover:bg-red-500/10" title="Delete Record">
                    <span class="material-symbols-outlined text-lg">delete</span>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

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
        localStorage.setItem("theme", htmlElement.classList.contains("dark") ? "dark" : "light");
        updateIcon();
    });
}
