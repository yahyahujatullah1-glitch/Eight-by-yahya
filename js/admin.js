import { supabase } from './supabase.js';

// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin9192", pass: "eight39" };
let db = []; // Player DB

// --- RANK DEFINITIONS ---
const ADMIN_RANKS = {
    1: "Secret Admin", 2: "Junior Admin", 3: "General Admin",
    4: "Senior Admin", 5: "Head Admin", 6: "Executive Admin",
    7: "Supervisor", 8: "Server Manager", 9: "Co Owner",
    10: "Server Owner", 11: "Developer"
};

// ==========================================
// 1. LOGIN LOGIC (Attached to Window)
// ==========================================
window.attemptLogin = function() {
    console.log("Attempting login...");
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();

    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
        // Hide Login
        document.getElementById('login-view').style.display = 'none';
        
        // Show Dashboard
        const dash = document.getElementById('dashboard-layout');
        dash.style.display = 'flex';
        
        // Initialize Data
        console.log("Login success. Fetching data...");
        window.switchTab('players'); 
        startSimulations();
    } else {
        document.getElementById('error-msg').style.display = 'block';
        // Shake animation
        const card = document.querySelector('.login-card');
        card.style.animation = 'none';
        setTimeout(() => card.style.animation = 'shake 0.4s', 10);
    }
}

// ==========================================
// 2. TAB SWITCHING
// ==========================================
window.switchTab = function(tabName) {
    // Hide all views
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    // Show selected view
    const targetView = document.getElementById(`view-${tabName}`);
    const targetNav = document.getElementById(`nav-${tabName}`);
    
    if (targetView) targetView.style.display = 'block';
    if (targetNav) targetNav.classList.add('active');
    
    // Load specific data
    if (tabName === 'players') renderPlayerTable();
    if (tabName === 'rules') {
        loadCategories();
        renderRulesTable();
    }
    
    // Mobile Menu Close
    const sidebar = document.getElementById('adminSidebar');
    if(sidebar) sidebar.classList.remove('open');
    const overlay = document.querySelector('.mobile-overlay');
    if(overlay) overlay.classList.remove('active');
}

// ==========================================
// 3. PLAYER MANAGEMENT (MySQL)
// ==========================================
async function renderPlayerTable() {
    try {
        const response = await fetch('/api/players');
        if (!response.ok) throw new Error("API Error");
        db = await response.json();
        
        const playerTbody = document.getElementById('player-table-body');
        const adminTbody = document.getElementById('admin-table-body');
        
        if (playerTbody) playerTbody.innerHTML = "";
        if (adminTbody) adminTbody.innerHTML = "";

        db.forEach((p, index) => {
            if (p.adminlevel > 0) {
                // ADMIN ROW
                const rankName = ADMIN_RANKS[p.adminlevel] || "Admin";
                if(adminTbody) {
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
                }
            } else {
                // PLAYER ROW
                const statusHtml = p.locked === 1 ? '<span class="status-pill status-banned">Banned</span>' : '<span class="status-pill status-active">Active</span>';
                if(playerTbody) {
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
            }
        });
    } catch (error) {
        showToast("Database Connection Failed", "red");
        console.error(error);
    }
}

// ==========================================
// 4. RULES MANAGEMENT (SUPABASE)
// ==========================================
window.loadCategories = async function() {
    const { data, error } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
    if (error) return console.error(error);

    const select = document.getElementById('rule-category-select');
    const list = document.getElementById('category-list');
    
    if(select) select.innerHTML = "";
    if(list) list.innerHTML = "";

    data.forEach(cat => {
        if(select) select.innerHTML += `<option value="${cat.slug}">${cat.name}</option>`;
        if(list) {
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid #222;">
                    <span style="color:#ccc; font-size:12px;">${cat.name}</span>
                    <i class="fa-solid fa-trash" style="color:#ef4444; cursor:pointer;" onclick="deleteCategory('${cat.slug}')"></i>
                </div>`;
        }
    });
}

window.addCategory = async function() {
    const name = document.getElementById('cat-name').value;
    const slug = document.getElementById('cat-slug').value.toLowerCase().replace(/\s+/g, '-');
    const { count } = await supabase.from('categories').select('*', { count: 'exact' });
    const { error } = await supabase.from('categories').insert([{ name, slug, order_index: count + 1 }]);

    if (error) showToast("Error: ID must be unique", "red");
    else {
        showToast("Category Created");
        loadCategories();
        document.getElementById('cat-name').value = "";
        document.getElementById('cat-slug').value = "";
    }
}

window.deleteCategory = async function(slug) {
    if(!confirm("Delete category?")) return;
    await supabase.from('categories').delete().eq('slug', slug);
    showToast("Category Deleted", "red");
    loadCategories();
    renderRulesTable();
}

window.renderRulesTable = async function() {
    const { data, error } = await supabase.from('rules').select('*').order('category_slug', { ascending: true });
    if (error) return;

    const tbody = document.getElementById('rules-table-body');
    if(!tbody) return;
    tbody.innerHTML = "";

    data.forEach(rule => {
        tbody.innerHTML += `
            <tr>
                <td style="color:var(--primary); font-size:11px; font-weight:700;">${rule.category_slug}</td>
                <td style="font-weight:700;">${rule.title}</td>
                <td style="color:#888; font-size:12px;">${rule.content.substring(0,40)}...</td>
                <td style="text-align:right;">
                    <button class="action-btn btn-ban" onclick="deleteRule(${rule.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

window.addRule = async function() {
    const category_slug = document.getElementById('rule-category-select').value;
    const title = document.getElementById('rule-title').value;
    const content = document.getElementById('rule-content').value;

    const { error } = await supabase.from('rules').insert([{ category_slug, title, content }]);

    if (error) showToast("Error adding rule", "red");
    else {
        showToast("Rule Added");
        renderRulesTable();
        document.getElementById('rule-title').value = "";
        document.getElementById('rule-content').value = "";
    }
}

window.deleteRule = async function(id) {
    if(!confirm("Delete rule?")) return;
    await supabase.from('rules').delete().eq('id', id);
    showToast("Rule Deleted");
    renderRulesTable();
}

// ==========================================
// 5. PLAYER ACTIONS (MySQL)
// ==========================================
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
    renderPlayerTable();
    showToast(`Staff Updated`);
    closeConfirm();
}

window.requestBanToggle = function(uid, locked) {
    showConfirm(locked === 1 ? "Unban?" : "Ban?", "Are you sure?", () => toggleBan(uid, locked));
}

async function toggleBan(uid, locked) {
    await fetch('/api/players', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ uid, status: locked === 1 ? 'Active' : 'Banned' }) });
    renderPlayerTable();
    showToast("Status Updated");
    closeConfirm();
}

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
    renderPlayerTable();
    showToast("Saved!");
}

// ==========================================
// 6. UTILS
// ==========================================
window.toggleAdminMenu = function() {
    const sidebar = document.getElementById('adminSidebar');
    if(sidebar) sidebar.classList.toggle('open');
    const overlay = document.querySelector('.mobile-overlay');
    if(overlay) overlay.classList.toggle('active');
}

window.logout = function() { location.reload(); }

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

window.showToast = function(msg, color="gold") {
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
        const cpuEl = document.getElementById('cpu-fill');
        if(cpuEl) {
            cpuEl.style.width = cpu + "%";
            document.getElementById('cpu-val').innerText = cpu + "%";
        }
    }, 2000);
        }
