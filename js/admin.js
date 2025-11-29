import { supabase } from './supabase.js';

// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin9192", pass: "eight39" };
let db = []; 

const ADMIN_RANKS = {
    1: "Secret Admin", 2: "Junior Admin", 3: "General Admin",
    4: "Senior Admin", 5: "Head Admin", 6: "Executive Admin",
    7: "Supervisor", 8: "Server Manager", 9: "Co Owner",
    10: "Server Owner", 11: "Developer"
};

// --- LOGIN ---
window.attemptLogin = function() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-layout').style.display = 'flex';
        renderTables();
        startSimulations();
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

// --- MYSQL FETCH (PLAYERS) ---
async function renderTables() {
    try {
        const response = await fetch('/api/players');
        db = await response.json();
        
        const playerTbody = document.getElementById('player-table-body');
        const adminTbody = document.getElementById('admin-table-body');
        
        playerTbody.innerHTML = "";
        adminTbody.innerHTML = "";

        db.forEach((p, index) => {
            if (p.adminlevel > 0) {
                // ADMIN ROW
                const rankName = ADMIN_RANKS[p.adminlevel] || "Admin";
                adminTbody.innerHTML += `
                    <tr>
                        <td style="color:#666">#${p.uid}</td>
                        <td><strong>${p.username}</strong></td>
                        <td style="color:var(--primary)">${rankName}</td>
                        <td><span class="status-pill status-active">${p.adminlevel}</span></td>
                        <td style="text-align:right;">
                            <button class="action-btn btn-up" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, 1)"><i class="fa-solid fa-arrow-up"></i></button>
                            <button class="action-btn btn-down" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, -1)"><i class="fa-solid fa-arrow-down"></i></button>
                            <button class="action-btn btn-fire" onclick="fireAdmin(${p.uid})"><i class="fa-solid fa-user-xmark"></i></button>
                        </td>
                    </tr>`;
            } else {
                // PLAYER ROW
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
    } catch (error) { showToast("MySQL Connection Failed", "red"); }
}

// --- SUPABASE FETCH (RULES) ---
async function renderRulesTable() {
    const { data, error } = await supabase
        .from('rules')
        .select('*')
        .order('category', { ascending: true })
        .order('id', { ascending: true });

    if (error) return showToast("Supabase Error", "red");

    const tbody = document.getElementById('rules-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = "";
    data.forEach(rule => {
        tbody.innerHTML += `
            <tr>
                <td style="color:var(--primary); font-weight:700; font-size:11px; text-transform:uppercase;">${rule.category}</td>
                <td style="font-weight:700;">${rule.title}</td>
                <td style="color:#888; font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${rule.content}</td>
                <td style="text-align:right;">
                    <button class="action-btn btn-ban" onclick="deleteRule(${rule.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

// --- RULE ACTIONS ---
window.addRule = async function() {
    const category = document.getElementById('rule-category').value;
    const title = document.getElementById('rule-title').value;
    const content = document.getElementById('rule-content').value;

    const { error } = await supabase.from('rules').insert([{ category, title, content }]);

    if (error) showToast("Error Adding Rule", "red");
    else {
        showToast("Rule Added!");
        document.getElementById('rule-title').value = "";
        document.getElementById('rule-content').value = "";
        renderRulesTable();
    }
}

window.deleteRule = async function(id) {
    if(!confirm("Delete this rule?")) return;
    const { error } = await supabase.from('rules').delete().eq('id', id);
    if (error) showToast("Error Deleting", "red");
    else {
        showToast("Rule Deleted");
        renderRulesTable();
    }
}

// --- PLAYER ACTIONS ---
window.makeAdmin = function(uid) {
    showConfirm("Promote?", "User will become Level 1 Admin.", () => updateAdminRank(uid, 1));
}

window.fireAdmin = function(uid) {
    showConfirm("Demote?", "Admin will be removed.", () => updateAdminRank(uid, 0));
}

window.changeAdminLevel = function(uid, current, change) {
    const newLvl = current + change;
    if (newLvl < 1) return window.fireAdmin(uid);
    if (newLvl > 11) return showToast("Max Level", "red");
    updateAdminRank(uid, newLvl);
}

async function updateAdminRank(uid, level) {
    await fetch('/api/players', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ uid, adminlevel: level }) });
    renderTables();
    showToast(`Staff Updated`);
    closeConfirm();
}

window.requestBanToggle = function(uid, locked) {
    showConfirm(locked === 1 ? "Unban?" : "Ban?", "Are you sure?", () => toggleBan(uid, locked));
}

async function toggleBan(uid, locked) {
    await fetch('/api/players', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ uid, status: locked === 1 ? 'Active' : 'Banned' }) });
    renderTables();
    showToast("Status Updated");
    closeConfirm();
}

// --- UTILS ---
window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`view-${tabName}`).style.display = 'block';
    document.getElementById(`nav-${tabName}`).classList.add('active');
    
    if(tabName === 'rules') renderRulesTable();
    
    // Close Mobile Menu
    const sidebar = document.getElementById('adminSidebar');
    if(sidebar) sidebar.classList.remove('open');
    document.querySelector('.mobile-overlay').classList.remove('active');
}

window.toggleAdminMenu = function() {
    document.getElementById('adminSidebar').classList.toggle('open');
    document.querySelector('.mobile-overlay').classList.toggle('active');
}

window.logout = function() { location.reload(); }

window.openEditModal = function(index) {
    const p = db[index];
    document.getElementById('edit-id').value = p.uid;
    document.getElementById('edit-name').value = p.username;
    document.getElementById('edit-money').value = p.cash;
    document.getElementById('edit-level').value = p.level;
    document.getElementById('edit-admin').value = p.adminlevel;
    document.getElementById('edit-modal').style.display = 'flex';
}

window.closeModal = function() { document.getElementById('edit-modal').style.display = 'none'; }

window.savePlayerChanges = async function() {
    const uid = document.getElementById('edit-id').value;
    const username = document.getElementById('edit-name').value;
    const cash = document.getElementById('edit-money').value;
    const level = document.getElementById('edit-level').value;
    const adminlevel = document.getElementById('edit-admin').value;

    await fetch('/api/players', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ uid, username, cash, level, adminlevel }) });
    closeModal();
    renderTables();
    showToast("Saved!");
}

// Confirmation Modal
function showConfirm(title, msg, callback) {
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-text').innerText = msg;
    const btn = document.getElementById('confirm-yes-btn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', callback);
    document.getElementById('confirm-modal').style.display = 'flex';
}
window.closeConfirm = function() { document.getElementById('confirm-modal').style.display = 'none'; }

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
}
