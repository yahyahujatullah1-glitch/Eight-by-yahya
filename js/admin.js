// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin9192", pass: "eight39" };

// --- INITIALIZE DATABASE (Mock) ---
let db = JSON.parse(localStorage.getItem('eightDB')) || [
    { id: 1001, name: "Sharma Ji", level: 52, admin: 5, money: 15000000, status: "Active" },
    { id: 1002, name: "Edgar", level: 30, admin: 4, money: 500000, status: "Active" },
    { id: 1003, name: "Hacker_X", level: 2, admin: 0, money: 99999999, status: "Banned" }
];

let appeals = [
    { user: "Hacker_X", reason: "I wasn't hacking, it was lag!", id: 1003 },
    { user: "NoobPlayer", reason: "Unban pls, sorry for RDM", id: 1005 }
];

// --- 1. AUTHENTICATION ---
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
function logout() { location.reload(); }

// --- 2. NAVIGATION ---
function switchTab(tabName) {
    // Hide all views
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    // Show selected
    document.getElementById(`view-${tabName}`).style.display = 'block';
    document.getElementById(`nav-${tabName}`).classList.add('active');
}

// --- 3. PLAYER MANAGEMENT ---
function initDashboard() {
    renderTable();
    renderAppeals();
    startSimulations();
}

function renderTable() {
    const tbody = document.getElementById('player-table-body');
    tbody.innerHTML = "";
    db.forEach((p, index) => {
        const statusClass = p.status === "Active" ? "status-active" : "status-banned";
        const row = `
            <tr>
                <td>#${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td>Lvl ${p.level}</td>
                <td style="color:var(--success)">$${p.money.toLocaleString()}</td>
                <td>${p.admin > 0 ? '<span style="color:var(--primary)">Admin '+p.admin+'</span>' : 'User'}</td>
                <td><span class="status-pill ${statusClass}">${p.status}</span></td>
                <td style="text-align:right;">
                    <button class="action-btn btn-edit" onclick="openEditModal(${index})"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn btn-ban" onclick="toggleBan(${index})" style="background:var(--danger);color:white;"><i class="fa-solid fa-ban"></i></button>
                </td>
            </tr>`;
        tbody.innerHTML += row;
    });
}

// --- 4. EDIT PLAYER MODAL ---
function openEditModal(index) {
    const p = db[index];
    document.getElementById('edit-id').value = index; // Store array index
    document.getElementById('edit-name').value = p.name;
    document.getElementById('edit-money').value = p.money;
    document.getElementById('edit-level').value = p.level;
    document.getElementById('edit-admin').value = p.admin;
    
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function savePlayerChanges() {
    const index = document.getElementById('edit-id').value;
    db[index].name = document.getElementById('edit-name').value;
    db[index].money = parseInt(document.getElementById('edit-money').value);
    db[index].level = parseInt(document.getElementById('edit-level').value);
    db[index].admin = parseInt(document.getElementById('edit-admin').value);
    
    localStorage.setItem('eightDB', JSON.stringify(db)); // Save to browser
    renderTable();
    closeModal();
    showToast("Player Data Updated");
}

function toggleBan(index) {
    db[index].status = db[index].status === "Active" ? "Banned" : "Active";
    renderTable();
    showToast(db[index].status === "Banned" ? "Player Banned" : "Player Unbanned");
}

function addFakeUser() {
    db.push({
        id: 1000 + db.length + 1,
        name: "New_Player_" + Math.floor(Math.random()*100),
        level: 1, admin: 0, money: 5000, status: "Active"
    });
    renderTable();
}

// --- 5. SIMULATED SYSTEMS ---
function renderAppeals() {
    const container = document.getElementById('appeals-container');
    container.innerHTML = "";
    appeals.forEach(a => {
        container.innerHTML += `
            <div class="appeal-card">
                <div class="appeal-header"><span class="appeal-user">${a.user} (ID: ${a.id})</span></div>
                <p class="appeal-reason">"${a.reason}"</p>
                <div class="appeal-actions">
                    <button class="btn-approve" onclick="showToast('Appeal Approved'); this.parentElement.parentElement.remove()">Approve</button>
                    <button class="btn-deny" onclick="showToast('Appeal Denied', 'red'); this.parentElement.parentElement.remove()">Deny</button>
                </div>
            </div>
        `;
    });
}

function startSimulations() {
    // Server Stats Simulation
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 30) + 20; // 20-50%
        const ram = Math.floor(Math.random() * 5) + 10;  // 10-15GB
        document.getElementById('cpu-fill').style.width = cpu + "%";
        document.getElementById('cpu-val').innerText = cpu + "%";
        document.getElementById('ram-fill').style.width = (ram/32)*100 + "%";
        document.getElementById('ram-val').innerText = ram + "GB / 32GB";
    }, 2000);

    // Live Logs Simulation
    const actions = ["connected", "disconnected", "bought vehicle", "started job", "died", "purchased house"];
    const names = ["Sharma", "Edgar", "Mesaii", "Yahya", "Behead", "RandomUser"];
    
    setInterval(() => {
        const logBox = document.getElementById('log-window');
        const name = names[Math.floor(Math.random() * names.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const time = new Date().toLocaleTimeString();
        
        const p = document.createElement('div');
        p.className = "log-line";
        p.innerHTML = `<span class="time">[${time}]</span> ${name} has ${action}.`;
        
        logBox.prepend(p); // Add to top
        if (logBox.children.length > 20) logBox.lastChild.remove(); // Keep list short
    }, 3000);
}

// --- UTILS ---
function showToast(msg, color="gold") {
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeftColor = color === "red" ? "#ef4444" : "#ffd700";
    t.innerHTML = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
