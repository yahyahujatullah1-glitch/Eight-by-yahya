// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin9192", pass: "eight39" };

// --- INITIALIZE MOCK DB ---
if (!localStorage.getItem('eightDB')) {
    const dummyData = [
        { id: 1001, name: "Sharma Ji", discord: "sharma#0001", money: 15000000, status: "Active" },
        { id: 1002, name: "Edgar", discord: "edgar_dev", money: 500000, status: "Active" },
        { id: 1003, name: "TrollAccount", discord: "hacker123", money: 0, status: "Banned" },
        { id: 1004, name: "Mesaii", discord: "mesaii#888", money: 2500000, status: "Active" },
    ];
    localStorage.setItem('eightDB', JSON.stringify(dummyData));
}

// --- LOGIN LOGIC ---
function attemptLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const err = document.getElementById('error-msg');

    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-view').style.display = 'flex';
        renderTable();
        showToast("Welcome back, Commander.", "success");
    } else {
        err.style.display = 'block';
        document.querySelector('.login-card').style.animation = 'none';
        setTimeout(() => document.querySelector('.login-card').style.animation = 'shake 0.4s', 10);
    }
}

function logout() {
    location.reload();
}

// --- TABLE RENDERER ---
function renderTable() {
    const players = JSON.parse(localStorage.getItem('eightDB'));
    const tbody = document.getElementById('player-table-body');
    tbody.innerHTML = "";

    players.forEach((p, i) => {
        const statusClass = p.status === "Active" ? "status-active" : "status-banned";
        const row = `
            <tr>
                <td style="color:#666">#${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td style="color:#888"><i class="fa-brands fa-discord"></i> ${p.discord}</td>
                <td style="color:var(--success)">$${p.money.toLocaleString()}</td>
                <td><span class="status-pill ${statusClass}">${p.status}</span></td>
                <td style="text-align: right;">
                    <button class="action-btn btn-ban" onclick="toggleStatus(${i})" title="Ban/Unban">
                        <i class="fa-solid fa-${p.status === 'Active' ? 'ban' : 'check'}"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteUser(${i})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// --- ACTIONS ---
function toggleStatus(index) {
    let data = JSON.parse(localStorage.getItem('eightDB'));
    data[index].status = data[index].status === "Active" ? "Banned" : "Active";
    localStorage.setItem('eightDB', JSON.stringify(data));
    renderTable();
    
    const msg = data[index].status === "Banned" ? "Player Banned Successfully" : "Player Unbanned";
    showToast(msg);
}

function deleteUser(index) {
    if(confirm("Delete this player permanently?")) {
        let data = JSON.parse(localStorage.getItem('eightDB'));
        data.splice(index, 1);
        localStorage.setItem('eightDB', JSON.stringify(data));
        renderTable();
        showToast("Player record deleted", "danger");
    }
}

function addFakeUser() {
    let data = JSON.parse(localStorage.getItem('eightDB'));
    const names = ["Drifter", "Officer_John", "Mafia_Boss", "Citizen_Kane"];
    const newP = {
        id: 1000 + data.length + 1,
        name: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random()*100),
        discord: "user_" + Math.floor(Math.random()*9999),
        money: Math.floor(Math.random() * 1000000),
        status: "Active"
    };
    data.push(newP);
    localStorage.setItem('eightDB', JSON.stringify(data));
    renderTable();
    showToast("New player simulated");
}

// --- TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = "normal") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;
    
    if(type === "danger") toast.style.borderLeftColor = "#ef4444";
    if(type === "success") toast.style.borderLeftColor = "#10b981";

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
