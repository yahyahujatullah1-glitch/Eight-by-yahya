// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin9192", pass: "eight39" };
let db = []; 

// --- RANKS ---
const ADMIN_RANKS = {
    1: "Secret Admin", 2: "Junior Admin", 3: "General Admin",
    4: "Senior Admin", 5: "Head Admin", 6: "Executive Admin",
    7: "Supervisor", 8: "Server Manager", 9: "Co Owner",
    10: "Server Owner", 11: "Developer"
};

// --- LOGIN ---
function attemptLogin() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-layout').style.display = 'flex';
        renderTables();
        startSimulations();
    } else {
        const err = document.getElementById('error-msg');
        err.style.display = 'block';
        err.innerText = "Incorrect ID or Key";
    }
}

// --- DATA FETCH ---
async function renderTables() {
    try {
        const response = await fetch('/api/players');
        db = await response.json();
        
        const playerTbody = document.getElementById('player-table-body');
        const adminTbody = document.getElementById('admin-table-body');
        
        playerTbody.innerHTML = "";
        adminTbody.innerHTML = "";

        db.forEach((p, index) => {
            // IF ADMIN
            if (p.adminlevel > 0) {
                const rankName = ADMIN_RANKS[p.adminlevel] || "Admin";
                adminTbody.innerHTML += `
                    <tr>
                        <td style="color:#666">#${p.uid}</td>
                        <td><strong>${p.username}</strong></td>
                        <td style="color:var(--primary)">${rankName}</td>
                        <td><span class="status-pill status-active">Lvl ${p.adminlevel}</span></td>
                        <td style="text-align:right;">
                            <button class="action-btn btn-up" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, 1)"><i class="fa-solid fa-arrow-up"></i></button>
                            <button class="action-btn btn-down" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, -1)"><i class="fa-solid fa-arrow-down"></i></button>
                            <button class="action-btn btn-fire" onclick="fireAdmin(${p.uid})"><i class="fa-solid fa-user-xmark"></i></button>
                        </td>
                    </tr>`;
            } 
            // IF PLAYER
            else {
                const statusHtml = p.locked === 1 ? '<span class="status-pill status-banned">Banned</span>' : '<span class="status-pill status-active">Active</span>';
                playerTbody.innerHTML += `
                    <tr>
                        <td style="color:#666">#${p.uid}</td>
                        <td><strong>${p.username}</strong></td>
                        <td style="font-size:12px">Lvl: ${p.level} | $${p.cash.toLocaleString()}</td>
                        <td>${statusHtml}</td>
                        <td style="text-align:right;">
                            <button class="action-btn btn-edit" onclick="openEditModal(${index})"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-btn btn-ban" onclick="requestBanToggle(${p.uid}, ${p.locked})"><i class="fa-solid fa-gavel"></i></button>
                            <button class="action-btn btn-promote" onclick="makeAdmin(${p.uid})"><i class="fa-solid fa-shield-halved"></i></button>
                        </td>
                    </tr>`;
            }
        });
    } catch (error) {
        showToast("Database Offline", "red");
    }
}

// --- ACTIONS (With Custom Confirm) ---

function makeAdmin(uid) {
    showConfirm("Promote Player?", "This user will become a Secret Admin (Level 1).", () => updateAdminRank(uid, 1));
}

function fireAdmin(uid) {
    showConfirm("Revoke Access?", "This admin will be demoted to Level 0 immediately.", () => updateAdminRank(uid, 0));
}

function changeAdminLevel(uid, current, change) {
    const newLvl = current + change;
    if (newLvl < 1) return fireAdmin(uid);
    if (newLvl > 11) return showToast("Max Level Reached", "red");
    updateAdminRank(uid, newLvl);
}

function requestBanToggle(uid, locked) {
    const action = locked === 1 ? "Unban" : "Ban";
    showConfirm(`${action} User?`, `Are you sure you want to ${action} this user?`, () => toggleBan(uid, locked));
}

// --- API HELPERS ---

async function updateAdminRank(uid, level) {
    await fetch('/api/players', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ uid, adminlevel: level }) });
    renderTables();
    showToast(`Staff Level Updated`);
    closeConfirm();
}

async function toggleBan(uid, locked) {
    await fetch('/api/players', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ uid, status: locked === 1 ? 'Active' : 'Banned' }) });
    renderTables();
    showToast("Status Updated");
    closeConfirm();
}

async function savePlayerChanges() {
    const uid = document.getElementById('edit-id').value;
    const username = document.getElementById('edit-name').value;
    const cash = document.getElementById('edit-money').value;
    const level = document.getElementById('edit-level').value;
    const adminlevel = document.getElementById('edit-admin').value;

    await fetch('/api/players', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ uid, username, cash, level, adminlevel }) });
    closeModal();
    renderTables();
    showToast("Data Saved");
}

// --- UI UTILS ---

function openEditModal(index) {
    const p = db[index];
    document.getElementById('edit-id').value = p.uid;
    document.getElementById('edit-name').value = p.username;
    document.getElementById('edit-money').value = p.cash;
    document.getElementById('edit-level').value = p.level;
    document.getElementById('edit-admin').value = p.adminlevel;
    document.getElementById('edit-modal').style.display = 'flex';
}

function showConfirm(title, msg, callback) {
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-text').innerText = msg;
    const btn = document.getElementById('confirm-yes-btn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', callback);
    document.getElementById('confirm-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('edit-modal').style.display = 'none'; }
function closeConfirm() { document.getElementById('confirm-modal').style.display = 'none'; }
function logout() { location.reload(); }

function switchTab(tabName) {
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${tabName}`).style.display = 'block';
    document.getElementById(`nav-${tabName}`).classList.add('active');
    
    // Close Mobile Menu
    document.getElementById('adminSidebar').classList.remove('open');
    document.querySelector('.mobile-overlay').classList.remove('active');
}

function toggleAdminMenu() {
    document.getElementById('adminSidebar').classList.toggle('open');
    document.querySelector('.mobile-overlay').classList.toggle('active');
}

function showToast(msg, color="gold") {
    const t = document.createElement('div');
    t.className = 'toast';
    if(color==="red") t.style.borderLeftColor="#ef4444";
    t.innerHTML = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function startSimulations() {
    setInterval(() => {
        const cpu = Math.floor(Math.random()*30)+20;
        if(document.getElementById('cpu-fill')) {
            document.getElementById('cpu-fill').style.width = cpu + "%";
            document.getElementById('cpu-val').innerText = cpu + "%";
        }
    }, 2000);
    
    // Log Simulation
    setInterval(() => {
        const log = document.getElementById('log-window');
        if(log) {
            const time = new Date().toLocaleTimeString();
            const div = document.createElement('div');
            div.className = "log-line";
            div.innerHTML = `<span class="time">[${time}]</span> System check... OK`;
            log.prepend(div);
            if(log.children.length > 20) log.lastChild.remove();
        }
    }, 4000);
}
