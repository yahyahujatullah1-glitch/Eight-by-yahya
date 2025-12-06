import { supabase } from './supabase.js';

// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin", pass: "eight123453" };
let db = []; 

const ADMIN_RANKS = {
    1: "Secret Admin", 2: "Junior Admin", 3: "General Admin",
    4: "Senior Admin", 5: "Head Admin", 6: "Executive Admin",
    7: "Supervisor", 8: "Server Manager", 9: "Co Owner",
    10: "Server Owner", 11: "Developer"
};

// ==========================================
// 1. INITIALIZATION & LOGIN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin Panel Loaded");

    // Bind Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload
            attemptLogin();
        });
    }

    // Bind other forms
    const catForm = document.getElementById('cat-form');
    if (catForm) catForm.addEventListener('submit', (e) => { e.preventDefault(); addCategory(); });

    const ruleForm = document.getElementById('rule-form');
    if (ruleForm) ruleForm.addEventListener('submit', (e) => { e.preventDefault(); addRule(); });
    
    const editForm = document.getElementById('edit-form');
    if (editForm) editForm.addEventListener('submit', (e) => { e.preventDefault(); savePlayerChanges(); });
});

// EXPOSE LOGIN TO WINDOW (Fixes button click issues)
window.attemptLogin = function() {
    console.log("Attempting Login...");
    
    const uInput = document.getElementById('username');
    const pInput = document.getElementById('password');

    if(!uInput || !pInput) {
        console.error("Input fields not found!");
        return;
    }

    const u = uInput.value.trim();
    const p = pInput.value.trim();

    console.log(`Checking: ${u} vs ${CREDENTIALS.user}`);

    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
        console.log("Login Success!");
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-layout').style.display = 'flex';
        
        // Load initial data
        switchTab('players'); 
    } else {
        console.log("Login Failed");
        const err = document.getElementById('error-msg');
        if(err) err.style.display = 'block';
    }
}

// ==========================================
// 2. TAB SWITCHING
// ==========================================
window.switchTab = function(tabName) {
    console.log("Switching tab to:", tabName);
    
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    const view = document.getElementById(`view-${tabName}`);
    if(view) view.style.display = 'block';
    
    const navItem = document.getElementById(`nav-${tabName}`);
    if(navItem) navItem.classList.add('active');
    
    if (tabName === 'players' || tabName === 'admins') renderPlayerTable();
    if (tabName === 'rules') {
        loadCategories();
        renderRulesTable();
    }
    
    // Mobile handling
    const sidebar = document.getElementById('adminSidebar');
    if(sidebar) sidebar.classList.remove('open');
    const overlay = document.querySelector('.mobile-overlay');
    if(overlay) overlay.style.display = 'none';
}

// ==========================================
// 3. MYSQL DATA (Uses API/Mock)
// ==========================================
async function renderPlayerTable() {
    try {
        const response = await fetch('/api/players'); 
        if(!response.ok) throw new Error("API Error: " + response.statusText);
        
        db = await response.json();
        
        const playerTbody = document.getElementById('player-table-body');
        const adminTbody = document.getElementById('admin-table-body');
        
        if(playerTbody) playerTbody.innerHTML = "";
        if(adminTbody) adminTbody.innerHTML = "";

        db.forEach((p, index) => {
            // ADMIN TABLE
            if (p.adminlevel > 0 && adminTbody) {
                adminTbody.innerHTML += `
                    <tr>
                        <td style="color:#64748b">#${p.uid}</td>
                        <td><strong style="color:white">${p.username}</strong></td>
                        <td style="color:var(--primary)">${ADMIN_RANKS[p.adminlevel] || "Staff"}</td>
                        <td><span class="status-pill status-active">Lvl ${p.adminlevel}</span></td>
                        <td style="text-align:right;">
                            <button class="action-btn btn-up" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, 1)"><i class="fa-solid fa-arrow-up"></i></button>
                            <button class="action-btn btn-down" onclick="changeAdminLevel(${p.uid}, ${p.adminlevel}, -1)"><i class="fa-solid fa-arrow-down"></i></button>
                            <button class="action-btn btn-fire" onclick="fireAdmin(${p.uid})"><i class="fa-solid fa-user-xmark"></i></button>
                        </td>
                    </tr>`;
            } 
            // PLAYER TABLE
            else if (playerTbody) {
                const statusHtml = p.locked === 1 
                    ? '<span class="status-pill status-banned">Banned</span>' 
                    : '<span class="status-pill status-active">Active</span>';
                
                playerTbody.innerHTML += `
                    <tr>
                        <td style="color:#64748b">#${p.uid}</td>
                        <td><strong style="color:white">${p.username}</strong></td>
                        <td style="font-size:12px; color:#94a3b8">Lvl: ${p.level} | $${p.cash.toLocaleString()}</td>
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
        showToast("Data Load Failed: " + error.message, "red");
        console.error(error);
    }
}

// ==========================================
// 4. SUPABASE (Rules)
// ==========================================
async function loadCategories() {
    try {
        const { data, error } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
        if (error) throw error;

        const select = document.getElementById('rule-category-select');
        const list = document.getElementById('category-list');
        
        if(select) select.innerHTML = "";
        if(list) list.innerHTML = "";

        if(data) {
            data.forEach(cat => {
                if(select) select.innerHTML += `<option value="${cat.slug}">${cat.name}</option>`;
                if(list) {
                    list.innerHTML += `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                            <span style="color:#ccc; font-size:12px;">${cat.name}</span>
                            <i class="fa-solid fa-trash" style="color:var(--danger); cursor:pointer;" onclick="deleteCategory('${cat.slug}')"></i>
                        </div>`;
                }
            });
        }
    } catch(e) { console.error("Rules Error:", e); }
}

async function addCategory() {
    const name = document.getElementById('cat-name').value;
    const slug = document.getElementById('cat-slug').value.toLowerCase().replace(/\s+/g, '-');
    await supabase.from('categories').insert([{ name, slug }]);
    showToast("Category Created");
    loadCategories();
}

window.deleteCategory = async function(slug) {
    if(!confirm("Delete category?")) return;
    await supabase.from('categories').delete().eq('slug', slug);
    showToast("Category Deleted", "red");
    loadCategories();
    renderRulesTable();
}

async function renderRulesTable() {
    const { data } = await supabase.from('rules').select('*').order('category', { ascending: true });
    
    const tbody = document.getElementById('rules-table-body');
    if(!tbody) return;
    tbody.innerHTML = "";

    if(data) {
        data.forEach(rule => {
            tbody.innerHTML += `
                <tr>
                    <td style="color:var(--primary); font-size:11px; font-weight:700;">${rule.category}</td>
                    <td style="font-weight:700; color:white;">${rule.title}</td>
                    <td style="color:#94a3b8; font-size:12px;">${rule.content ? rule.content.substring(0,40) : ""}...</td>
                    <td style="text-align:right;">
                        <button class="action-btn btn-ban" onclick="deleteRule(${rule.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    }
}

async function addRule() {
    const category = document.getElementById('rule-category-select').value;
    const title = document.getElementById('rule-title').value;
    const content = document.getElementById('rule-content').value;

    await supabase.from('rules').insert([{ category, title, content }]);
    showToast("Rule Added");
    renderRulesTable();
}

window.deleteRule = async function(id) {
    if(!confirm("Delete rule?")) return;
    await supabase.from('rules').delete().eq('id', id);
    showToast("Rule Deleted");
    renderRulesTable();
}

// ==========================================
// 5. PLAYER ACTIONS (Window Exposed)
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

// Expose save to window or use event listener
window.savePlayerChanges = async function() {
    const uid = document.getElementById('edit-id').value;
    const username = document.getElementById('edit-name').value;
    const cash = document.getElementById('edit-money').value;
    const level = document.getElementById('edit-level').value;
    const adminlevel = document.getElementById('edit-admin').value;

    await fetch('/api/players', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ uid, username, cash, level, adminlevel }) });
    closeModal();
    renderPlayerTable();
    showToast("Changes Saved!");
}

// ==========================================
// 6. UTILS
// ==========================================
window.toggleAdminMenu = function() {
    const sidebar = document.getElementById('adminSidebar');
    sidebar.classList.toggle('open');
    const overlay = document.querySelector('.mobile-overlay');
    if(overlay) {
        overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    }
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

window.showToast = function(msg, color="cyan") {
    const t = document.createElement('div');
    t.className = 'toast';
    if(color==="red") t.style.borderLeftColor="#ef4444";
    t.innerHTML = msg;
    const container = document.getElementById('toast-container');
    if(container) container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
    }
