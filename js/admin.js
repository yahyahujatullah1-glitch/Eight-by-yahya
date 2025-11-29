import { supabase } from './supabase.js';

// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin", pass: "eight123" };
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
        // Initial load
        window.switchTab('players'); 
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

// --- SWITCH TABS ---
window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`view-${tabName}`).style.display = 'block';
    const navItem = document.getElementById(`nav-${tabName}`);
    if(navItem) navItem.classList.add('active');
    
    if (tabName === 'rules') {
        loadCategories();
        renderRulesTable();
    }
    
    const sidebar = document.getElementById('adminSidebar');
    if(sidebar) sidebar.classList.remove('open');
    const overlay = document.querySelector('.mobile-overlay');
    if(overlay) overlay.classList.remove('active');
}

// --- CATEGORY MANAGEMENT ---
window.loadCategories = async function() {
    const { data, error } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
    if (error) return console.error(error);

    const select = document.getElementById('rule-category-select');
    const list = document.getElementById('category-list');
    
    if(select) select.innerHTML = "";
    if(list) list.innerHTML = "";

    data.forEach(cat => {
        // Dropdown Option
        if(select) select.innerHTML += `<option value="${cat.slug}">${cat.name}</option>`;
        
        // List Item
        if(list) {
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid #222;">
                    <span style="color:#ccc; font-size:12px;">${cat.name}</span>
                    <i class="fa-solid fa-trash" style="color:#ef4444; cursor:pointer;" onclick="deleteCategory('${cat.slug}')"></i>
                </div>
            `;
        }
    });
}

window.addCategory = async function() {
    const name = document.getElementById('cat-name').value;
    const slug = document.getElementById('cat-slug').value.toLowerCase().replace(/\s+/g, '-');
    const { count } = await supabase.from('categories').select('*', { count: 'exact' });
    const { error } = await supabase.from('categories').insert([{ name, slug, order_index: count + 1 }]);

    if (error) showToast("Error: " + error.message, "red");
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

// --- RULE MANAGEMENT (FIXED COLUMN NAME) ---
window.renderRulesTable = async function() {
    // UPDATED: Using 'category' instead of 'category_slug' based on your error
    const { data, error } = await supabase.from('rules').select('*').order('category', { ascending: true });
    if (error) return;

    const tbody = document.getElementById('rules-table-body');
    if(!tbody) return;
    tbody.innerHTML = "";

    data.forEach(rule => {
        tbody.innerHTML += `
            <tr>
                <td style="color:var(--primary); font-size:11px; font-weight:700;">${rule.category}</td>
                <td style="font-weight:700;">${rule.title}</td>
                <td style="color:#888; font-size:12px;">${rule.content.substring(0,40)}...</td>
                <td style="text-align:right;">
                    <button class="action-btn btn-ban" onclick="deleteRule(${rule.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

window.addRule = async function() {
    const categoryVal = document.getElementById('rule-category-select').value;
    const title = document.getElementById('rule-title').value;
    const content = document.getElementById('rule-content').value;

    console.log("Adding rule...", categoryVal);

    // UPDATED: Sending 'category' to match your database column
    const { error } = await supabase.from('rules').insert([{ category: categoryVal, title, content }]);

    if (error) {
        console.error(error);
        showToast("Error: " + error.message, "red");
    } else {
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

// --- PLAYER ACTIONS (MySQL) ---
async function renderPlayerTable() {
    try {
        const response = await fetch('/api/players');
        db = await response.json();
        
        const playerTbody = document.getElementById('player-table-body');
        const adminTbody = document.getElementById('admin-table-body');
        
        if(playerTbody) playerTbody.innerHTML = "";
        if(adminTbody) adminTbody.innerHTML = "";

        db.forEach((p, index) => {
            if (p.adminlevel > 0) {
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
    } catch (error) { showToast("MySQL Connection Failed", "red"); }
}

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

// --- UTILS ---
window.toggleAdminMenu = function() {
    document.getElementById('adminSidebar').classList.toggle('open');
    document.querySelector('.mobile-overlay').classList.toggle('active');
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
