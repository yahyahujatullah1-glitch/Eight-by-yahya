// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin9192", pass: "eight39" };
let db = []; 

// --- 1. LOGIN ---
function attemptLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-layout').style.display = 'flex';
        initDashboard(); 
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

// --- 2. DATA MANAGEMENT ---
async function initDashboard() {
    await renderTable();
    startSimulations(); 
}

// FETCH DATA FROM VERCEL API
async function renderTable() {
    try {
        const response = await fetch('/api/players');
        db = await response.json();
        
        const tbody = document.getElementById('player-table-body');
        tbody.innerHTML = "";

        db.forEach((p, index) => {
            // Convert DB 'locked' column (1/0) to Text
            const isBanned = p.locked === 1;
            const statusText = isBanned ? "Banned" : "Active";
            const statusClass = isBanned ? "status-banned" : "status-active";
            
            // Handle null discord tags
            const discordDisplay = p.discordtag ? p.discordtag : 'Not Linked';

            const row = `
                <tr>
                    <td style="color:#666">#${p.uid}</td>
                    <td><strong>${p.username}</strong></td>
                    <td>Lvl ${p.level}</td>
                    <td style="color:var(--success)">$${p.cash.toLocaleString()}</td>
                    <td>${p.adminlevel > 0 ? '<span style="color:var(--primary)">Admin '+p.adminlevel+'</span>' : 'User'}</td>
                    <td><span class="status-pill ${statusClass}">${statusText}</span></td>
                    <td style="text-align:right;">
                        <button class="action-btn btn-edit" onclick="openEditModal(${index})"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn btn-ban" onclick="toggleBan(${p.uid}, ${p.locked})" style="background:var(--danger);color:white;"><i class="fa-solid fa-gavel"></i></button>
                    </td>
                </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error("Database Error:", error);
        showToast("Error loading database", "red");
    }
}

// --- 3. EDIT PLAYER ---
function openEditModal(index) {
    const p = db[index];
    // Fill the modal inputs with current data
    document.getElementById('edit-id').value = p.uid; 
    document.getElementById('edit-name').value = p.username;
    document.getElementById('edit-money').value = p.cash;
    document.getElementById('edit-level').value = p.level;
    document.getElementById('edit-admin').value = p.adminlevel;
    
    document.getElementById('edit-modal').style.display = 'flex';
}

async function savePlayerChanges() {
    // Get values from inputs
    const uid = document.getElementById('edit-id').value;
    const username = document.getElementById('edit-name').value;
    const cash = document.getElementById('edit-money').value;
    const level = document.getElementById('edit-level').value;
    const adminlevel = document.getElementById('edit-admin').value;

    try {
        await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username, cash, level, adminlevel })
        });
        
        closeModal();
        renderTable(); // Refresh list
        showToast("Player Updated Successfully");
    } catch (error) {
        showToast("Save Failed", "red");
    }
}

async function toggleBan(uid, currentLockState) {
    // If locked is 1, make it 0 (Active). If 0, make it Banned.
    const newStatus = currentLockState === 1 ? "Active" : "Banned";
    
    try {
        await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: uid, status: newStatus })
        });
        renderTable();
        showToast(`Player ${newStatus}`);
    } catch (error) {
        showToast("Error changing status", "red");
    }
}

// --- UTILS ---
function closeModal() { document.getElementById('edit-modal').style.display = 'none'; }
function logout() { location.reload(); }
function switchTab(tabName) {
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${tabName}`).style.display = 'block';
    document.getElementById(`nav-${tabName}`).classList.add('active');
}

function showToast(msg, color="gold") {
    const t = document.createElement('div');
    t.className = 'toast';
    if(color === "red") t.style.borderLeftColor = "#ef4444";
    t.innerHTML = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Simulation for visual flair (CPU/Logs)
function startSimulations() {
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 30) + 20; 
        if(document.getElementById('cpu-fill')) {
            document.getElementById('cpu-fill').style.width = cpu + "%";
            document.getElementById('cpu-val').innerText = cpu + "%";
        }
    }, 2000);
}
