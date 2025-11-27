// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin9192", pass: "eight39" };
let db = []; // Global data store

// --- RANK DEFINITIONS ---
const ADMIN_RANKS = {
    1: "Secret Admin",
    2: "Junior Admin",
    3: "General Admin",
    4: "Senior Admin",
    5: "Head Admin",
    6: "Executive Admin",
    7: "Supervisor",
    8: "Server Manager",
    9: "Co Owner",
    10: "Server Owner",
    11: "Developer"
};

// --- LOGIN ---
function attemptLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-layout').style.display = 'flex';
        renderTables();
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

// --- CORE DATA FETCH ---
async function renderTables() {
    try {
        const response = await fetch('/api/players');
        db = await response.json();
        
        const playerTbody = document.getElementById('player-table-body');
        const adminTbody = document.getElementById('admin-table-body');
        
        playerTbody.innerHTML = "";
        adminTbody.innerHTML = "";

        db.forEach((p, index) => {
            // Is this user an Admin?
            if (p.adminlevel > 0) {
                // RENDER ADMIN ROW
                const rankName = ADMIN_RANKS[p.adminlevel] || "Unknown Rank";
                const row = `
                    <tr>
                        <td style="color:#666">#${p.uid}</td>
                        <td><strong>${p.username}</strong></td>
                        <td style="color:var(--primary); font-weight:700;">${rankName}</td>
                        <td><span class="badge lvl-badge">${p.adminlevel}</span></td>
                        <td style="text-align:right;">
                            <button class="action-btn btn-up" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, 1)" title="Promote"><i class="fa-solid fa-arrow-up"></i></button>
                            <button class="action-btn btn-down" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, -1)" title="Demote"><i class="fa-solid fa-arrow-down"></i></button>
                            <button class="action-btn btn-fire" onclick="fireAdmin(${p.uid})" title="Remove Admin"><i class="fa-solid fa-user-slash"></i></button>
                        </td>
                    </tr>`;
                adminTbody.innerHTML += row;
            } else {
                // RENDER PLAYER ROW
                const isBanned = p.locked === 1;
                const statusHtml = isBanned 
                    ? '<span class="status-pill status-banned">Banned</span>' 
                    : '<span class="status-pill status-active">Active</span>';
                
                const vipText = p.vippackage > 0 ? `<span style="color:gold">VIP ${p.vippackage}</span>` : 'None';

                const row = `
                    <tr>
                        <td style="color:#666">#${p.uid}</td>
                        <td><strong>${p.username}</strong></td>
                        <td style="font-size:12px">Lvl: ${p.level} | $${p.cash.toLocaleString()} | ${p.hours} Hrs</td>
                        <td>${vipText}</td>
                        <td>${statusHtml}</td>
                        <td style="text-align:right;">
                            <button class="action-btn btn-edit" onclick="openEditModal(${index})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-btn btn-ban" onclick="toggleBan(${p.uid}, ${p.locked})"><i class="fa-solid fa-gavel"></i></button>
                            <button class="action-btn btn-promote" onclick="makeAdmin(${p.uid})" title="Make Admin"><i class="fa-solid fa-shield-halved"></i></button>
                        </td>
                    </tr>`;
                playerTbody.innerHTML += row;
            }
        });
    } catch (error) {
        showToast("Database Error", "red");
    }
}

// --- ADMIN MANAGEMENT ACTIONS ---

// 1. Promote Player to Admin Level 1
async function makeAdmin(uid) {
    if(!confirm("Are you sure you want to promote this player to Secret Admin (Level 1)?")) return;
    updateAdminRank(uid, 1);
}

// 2. Fire Admin (Set Level to 0)
async function fireAdmin(uid) {
    if(!confirm("WARNING: Remove this user from the staff team?")) return;
    updateAdminRank(uid, 0);
}

// 3. Promote/Demote (+1 / -1)
async function changeAdminLevel(uid, currentLvl, change) {
    const newLvl = currentLvl + change;
    if (newLvl < 1) return fireAdmin(uid); // If demoted below 1, fire them
    if (newLvl > 11) return showToast("Max Level Reached", "red");
    
    updateAdminRank(uid, newLvl);
}

// API Call Helper
async function updateAdminRank(uid, newLevel) {
    try {
        await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: uid, adminlevel: newLevel }) // Send only adminlevel update
        });
        renderTables();
        showToast(`Staff updated. New Level: ${newLevel}`);
    } catch (error) {
        showToast("Update Failed", "red");
    }
}

// --- STANDARD PLAYER ACTIONS ---

function openEditModal(index) {
    // Logic handles searching the global 'db' array
    const p = db[index]; 
    if(!p) return;
    
    document.getElementById('edit-id').value = p.uid;
    document.getElementById('edit-name').value = p.username;
    document.getElementById('edit-money').value = p.cash;
    document.getElementById('edit-level').value = p.level;
    document.getElementById('edit-admin').value = p.adminlevel;
    document.getElementById('edit-modal').style.display = 'flex';
}

async function savePlayerChanges() {
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
        renderTables();
        showToast("Saved Successfully");
    } catch (error) { showToast("Save Error", "red"); }
}

async function toggleBan(uid, locked) {
    const newStatus = locked === 1 ? "Active" : "Banned";
    try {
        await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: uid, status: newStatus })
        });
        renderTables();
        showToast("Ban Status Updated");
    } catch (error) { showToast("Error", "red"); }
}

// --- UI UTILS ---
function closeModal() { document.getElementById('edit-modal').style.display = 'none'; }
function logout() { location.reload(); }

function switchTab(tabName) {
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${tabName}`).style.display = 'block';
    document.getElementById(`nav-${tabName}`).classList.add('active');
    
    // Close mobile menu if open
    document.getElementById('adminSidebar').classList.remove('open');
}

// Mobile Menu Toggle
function toggleAdminMenu() {
    document.getElementById('adminSidebar').classList.toggle('open');
}

function showToast(msg, color="gold") {
    const t = document.createElement('div');
    t.className = 'toast';
    if(color === "red") t.style.borderLeftColor = "#ef4444";
    t.innerHTML = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
            }            body: JSON.stringify({ uid: uid, status: newStatus })
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
