// --- CONFIGURATION ---
const CREDENTIALS = { 
    user: "eight@admin9192", 
    pass: "eight39" 
};

let db = []; // Global variable for player data

// --- 1. LOGIN LOGIC (FIXED) ---
function attemptLogin() {
    // Get values and remove accidental spaces
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    
    const loginView = document.getElementById('login-view');
    const dashView = document.getElementById('dashboard-layout');
    const errorText = document.getElementById('error-msg');

    console.log("Checking credentials..."); // For debugging

    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
        // 1. Hide Login Screen
        loginView.style.display = 'none';
        
        // 2. Show Dashboard (Force Flex)
        dashView.style.display = 'flex';
        
        // 3. Load Data
        console.log("Login Successful. Loading tables...");
        renderTables();
    } else {
        // Show Error
        console.log("Login Failed");
        errorText.style.display = 'block';
        errorText.innerText = "Incorrect Username or Password";
        
        // Shake Animation
        const card = document.querySelector('.login-card');
        card.style.animation = 'none';
        setTimeout(() => card.style.animation = 'shake 0.4s', 10);
    }
}

function logout() {
    location.reload();
}

// --- 2. DATA FETCHING ---
async function renderTables() {
    try {
        const response = await fetch('/api/players');
        if (!response.ok) throw new Error("API Connection Failed");
        
        db = await response.json();
        
        const playerTbody = document.getElementById('player-table-body');
        const adminTbody = document.getElementById('admin-table-body');
        
        // Clear tables
        if(playerTbody) playerTbody.innerHTML = "";
        if(adminTbody) adminTbody.innerHTML = "";

        db.forEach((p, index) => {
            // ADMIN TABLE
            if (p.adminlevel > 0) {
                const rankName = getRankName(p.adminlevel);
                if(adminTbody) {
                    adminTbody.innerHTML += `
                    <tr>
                        <td style="color:#666">#${p.uid}</td>
                        <td><strong>${p.username}</strong></td>
                        <td style="color:var(--primary); font-weight:700;">${rankName}</td>
                        <td><span class="lvl-badge">${p.adminlevel}</span></td>
                        <td style="text-align:right;">
                            <button class="action-btn btn-up" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, 1)"><i class="fa-solid fa-arrow-up"></i></button>
                            <button class="action-btn btn-down" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, -1)"><i class="fa-solid fa-arrow-down"></i></button>
                            <button class="action-btn btn-fire" onclick="fireAdmin(${p.uid})"><i class="fa-solid fa-user-slash"></i></button>
                        </td>
                    </tr>`;
                }
            } 
            // PLAYER TABLE
            else {
                const isBanned = p.locked === 1;
                const statusHtml = isBanned 
                    ? '<span class="status-pill status-banned">Banned</span>' 
                    : '<span class="status-pill status-active">Active</span>';
                
                const vipText = p.vippackage > 0 ? `<span style="color:gold">VIP ${p.vippackage}</span>` : 'None';

                if(playerTbody) {
                    playerTbody.innerHTML += `
                    <tr>
                        <td style="color:#666">#${p.uid}</td>
                        <td><strong>${p.username}</strong></td>
                        <td style="font-size:12px">Lvl: ${p.level} | $${p.cash.toLocaleString()}</td>
                        <td>${vipText}</td>
                        <td>${statusHtml}</td>
                        <td style="text-align:right;">
                            <button class="action-btn btn-edit" onclick="openEditModal(${index})"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-btn btn-ban" onclick="toggleBan(${p.uid}, ${p.locked})"><i class="fa-solid fa-gavel"></i></button>
                            <button class="action-btn btn-promote" onclick="makeAdmin(${p.uid})"><i class="fa-solid fa-shield-halved"></i></button>
                        </td>
                    </tr>`;
                }
            }
        });
    } catch (error) {
        console.error(error);
        showToast("Database Connection Failed", "red");
    }
}

// --- 3. ACTIONS ---

// Helper for Rank Names
function getRankName(level) {
    const ranks = {
        1: "Secret Admin", 2: "Junior Admin", 3: "General Admin",
        4: "Senior Admin", 5: "Head Admin", 6: "Executive Admin",
        7: "Supervisor", 8: "Server Manager", 9: "Co Owner",
        10: "Server Owner", 11: "Developer"
    };
    return ranks[level] || "Unknown Rank";
}

// Promote to Admin
async function makeAdmin(uid) {
    if(!confirm("Promote to Admin Level 1?")) return;
    updateAdminRank(uid, 1);
}

// Fire Admin
async function fireAdmin(uid) {
    if(!confirm("Remove from Staff?")) return;
    updateAdminRank(uid, 0);
}

// Change Level
async function changeAdminLevel(uid, currentLvl, change) {
    const newLvl = currentLvl + change;
    if (newLvl < 1) return fireAdmin(uid);
    if (newLvl > 11) return showToast("Max Level", "red");
    updateAdminRank(uid, newLvl);
}

async function updateAdminRank(uid, newLevel) {
    try {
        await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: uid, adminlevel: newLevel })
        });
        renderTables();
        showToast(`Staff Level Updated: ${newLevel}`);
    } catch (error) { showToast("Error", "red"); }
}

// Edit Modal
function openEditModal(index) {
    const p = db[index];
    if(!p) return;
    document.getElementById('edit-id').value = p.uid;
    document.getElementById('edit-name').value = p.username;
    document.getElementById('edit-money').value = p.cash;
    document.getElementById('edit-level').value = p.level;
    document.getElementById('edit-admin').value = p.adminlevel;
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('edit-modal').style.display = 'none'; }

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
    } catch (error) { showToast("Save Failed", "red"); }
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
        showToast("Status Updated");
    } catch (error) { showToast("Error", "red"); }
}

// --- UTILS ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`view-${tabName}`).style.display = 'block';
    document.getElementById(`nav-${tabName}`).classList.add('active');
    
    // Mobile: Close menu on click
    const sidebar = document.querySelector('.sidebar');
    if(sidebar.classList.contains('open')) toggleAdminMenu();
}

function toggleAdminMenu() {
    document.querySelector('.sidebar').classList.toggle('open');
}

function showToast(msg, color="gold") {
    const t = document.createElement('div');
    t.className = 'toast';
    if(color === "red") t.style.borderLeftColor = "#ef4444";
    t.innerHTML = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Start Simulations
function startSimulations() {
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 30) + 20; 
        const el = document.getElementById('cpu-fill');
        if(el) {
            el.style.width = cpu + "%";
            document.getElementById('cpu-val').innerText = cpu + "%";
        }
    }, 2000);
            }
