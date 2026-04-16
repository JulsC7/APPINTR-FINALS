let allSeminars = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchSeminars();
    setupEventListeners();
    initTheme();
});

function setupEventListeners() {
    const searchInput = document.getElementById('seminarSearch');
    const statusFilter = document.getElementById('statusFilter');
    const resetBtn = document.getElementById('resetFilters');

    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);

    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        statusFilter.value = '';
        applyFilters();
    });
}

async function fetchSeminars() {
    const apiEndpoint = 'http://127.0.0.1:8000/api/seminars/'; 

    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        allSeminars = data; // Store master list
        renderSeminars(data);
        
    } catch (error) {
        console.error("Could not fetch seminars:", error);
        document.getElementById('seminars-list').innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-10 text-center text-red-500">
                    Failed to load data. Make sure your Django server is running.
                </td>
            </tr>`;
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('seminarSearch').value.toLowerCase();
    const selectedStatus = document.getElementById('statusFilter').value;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = allSeminars.filter(seminar => {
        const seminarDate = new Date(seminar.date);
        const isUpcoming = seminarDate >= today;
        
        const matchesSearch = 
            seminar.title.toLowerCase().includes(searchTerm) || 
            (seminar.location && seminar.location.toLowerCase().includes(searchTerm));

        let matchesStatus = true;
        if (selectedStatus === 'upcoming') matchesStatus = isUpcoming;
        if (selectedStatus === 'completed') matchesStatus = !isUpcoming;

        return matchesSearch && matchesStatus;
    });

    renderSeminars(filtered);
}

function renderSeminars(seminars) {
    const tableBody = document.getElementById('seminars-list');
    const countElement = document.getElementById('seminar-count');
    
    tableBody.innerHTML = ''; 
    countElement.textContent = seminars.length;

    if (seminars.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-10 text-center text-slate-500 italic">
                    No seminars match your search criteria.
                </td>
            </tr>`;
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    seminars.forEach(seminar => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";
        
        const seminarDate = new Date(seminar.date);
        const formattedDate = new Date(seminarDate.getTime() + Math.abs(seminarDate.getTimezoneOffset()*60000))
                                .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        const isUpcoming = seminarDate >= today;
        const statusBadge = isUpcoming
            ? `<span class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border border-emerald-200 dark:border-emerald-800">Upcoming</span>`
            : `<span class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border border-slate-200 dark:border-slate-700">Completed</span>`;

        const description = seminar.description ? seminar.description.substring(0, 80) + '...' : '<span class="italic opacity-50">No description provided</span>';
        const location = seminar.location || 'TBA';

        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="font-bold text-slate-800 dark:text-white text-base">${seminar.title}</div>
                 <div class="text-xs text-slate-500 dark:text-white/70 mt-1 max-w-md">${description}</div>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2 font-medium">
                    <span class="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                    ${formattedDate}
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span class="material-symbols-outlined text-[16px]">location_on</span>
                    ${location}
                </div>
            </td>
            <td class="px-6 py-4">${statusBadge}</td>
            <td class="px-6 py-4 text-right">
                <button class="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10" title="Edit">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="text-slate-400 hover:text-red-500 transition-colors p-2 ml-1 rounded-lg hover:bg-red-500/10" title="Delete">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </td>`;
        
        tableBody.appendChild(tr);
    });
}

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    const updateIcon = () => {
        themeIcon.textContent = htmlElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
    };

    updateIcon();

    themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        localStorage.setItem('theme', htmlElement.classList.contains('dark') ? 'dark' : 'light');
        updateIcon();
    });
} 
