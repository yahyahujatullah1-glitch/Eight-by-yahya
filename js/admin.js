import { supabase } from './supabase.js';

// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin", pass: "eight123453" };

// --- LOCAL MOCK DATA (No API Needed) ---
let playersDB = [
    { uid: 1, username: "Star_Owner", cash: 100000000, level: 99, adminlevel: 10, locked: 0 },
    { uid: 2, username: "Admin_Jane", cash: 50000, level: 50, adminlevel: 5, locked: 0 },
    { uid: 3, username: "Cop_Mike", cash: 1200, level: 10, adminlevel: 0, locked: 0 },
    { uid: 4, username: "Banned_User", cash: 0, level: 2, adminlevel: 0, locked: 1 },
    { uid: 5, username: "New_Player", cash: 500, level: 1, adminlevel: 0, locked: 0 }
];

const ADMIN_RANKS = {
    1: "Secret Admin", 2: "Junior Admin", 3: "General Admin",
    4: "Senior Admin", 5: "Head Admin", 6: "Executive Admin",
    7: "Supervisor", 8: "Server Manager", 9: "Co Owner",
    10: "Server Owner", 11: "Developer"
};

// ==========================================
// 1. INITIALIZATION (DOM READY)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin Panel Loaded");

    // LOGIN
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        attemptLogin();
    });

    // NAVIGATION
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.closest('.nav-item').dataset.tab;
            switchTab(tab);
        });
    });

    // MOBILE MENU
    document.getElementById('menu-toggle-btn')?.addEventListener('click', toggleAdminMenu);
    document.getElementById('close-sidebar-btn')?.addEventListener('click', toggleAdminMenu);
    document.querySelector('.mobile-overlay')?.addEventListener('click', toggleAdminMenu);

    // LOGOUT
    document.getElementById('logout-btn')?.addEventListener('click', () => location.reload());

    // MODALS
    document.getElementById('confirm-cancel-btn')?.addEventListener('click', closeConfirm);
    document.getElementById('close-edit-btn')?.addEventListener('click', closeModal);

    // FORMS
    document.getElementById('cat-form')?.addEventListener('submit', (e) => { e.preventDefault(); addCategory(); });
    document.getElementById('rule-form')?.addEventListener('submit', (e) => { e.preventDefault(); addRule(); });
    document.getElementById('edit-form')?.addEventListener('submit', (e) => { e.preventDefault(); savePlayerChanges(); });
});

// ==========================================
// 2. CORE FUNCTIONS
// ==========================================

function attemptLogin() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();

    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
        console.log("Login Success");
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-layout').style.display = 'flex';
        switchTab('players');
    } else {
        console.log("Login Failed");
        document.getElementById('error-msg').style.display = 'block';
    }
}

function switchTab(tabName) {
    // Hide all views
    document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Show target view
    const view = document.getElementById(`view-${tabName}`);
    if (view) view.style.display = 'block';

    const nav = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (nav) nav.classList.add('active');

    // Load Data
    if (tabName === 'players' || tabName === 'admins') renderPlayerTable();
    if (tabName === 'rules') {
        loadCategories();
        renderRulesTable();
    }

    // Close Mobile Menu
    document.getElementById('adminSidebar').classList.remove('open');
    document.querySelector('.mobile-overlay').style.display = 'none';
}

// ==========================================
// 3. PLAYER DATA (MOCK)
// ==========================================
function renderPlayerTable() {
    const playerTbody = document.getElementById('player-table-body');
    const adminTbody = document.getElementById('admin-table-body');

    if (playerTbody) playerTbody.innerHTML = "";
    if (adminTbody) adminTbody.innerHTML = "";

    playersDB.forEach((p) => {
        // ADMIN TABLE
        if (p.adminlevel > 0 && adminTbody) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="color:#64748b">#${p.uid}</td>
                <td><strong style="color:white">${p.username}</strong></td>
                <td style="color:var(--primary)">${ADMIN_RANKS[p.adminlevel] || "Staff"}</td>
                <td><span class="status-pill status-active">Lvl ${p.adminlevel}</span></td>
                <td style="text-align:right;">
                    <button class="action-btn btn-up"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="action-btn btn-down"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="action-btn btn-fire"><i class="fa-solid fa-user-xmark"></i></button>
                </td>
            `;
            // Attach Events
            row.querySelector('.btn-up').onclick = () => changeAdminLevel(p.uid, p.adminlevel, 1);
            row.querySelector('.btn-down').onclick = () => changeAdminLevel(p.uid, p.adminlevel, -1);
            row.querySelector('.btn-fire').onclick = () => fireAdmin(p.uid);
            adminTbody.appendChild(row);
        }

        // PLAYER TABLE
        if (playerTbody) {
            const statusHtml = p.locked === 1 
                ? '<span class="status-pill status-banned">Banned</span>' 
                : '<span class="status-pill status-active">Active</span>';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="color:#64748b">#${p.uid}</td>
                <td><strong style="color:white">${p.username}</strong></td>
                <td style="font-size:12px; color:#94a3b8">Lvl: ${p.level} | $${p.cash.toLocaleString()}</td>
                <td>${statusHtml}</td>
                <td style="text-align:right;">
                    <button class="action-btn btn-edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn btn-ban"><i class="fa-solid fa-gavel"></i></button>
                    <button class="action-btn btn-promote"><i class="fa-solid fa-shield-halved"></i></button>
                </td>
            `;
            // Attach Events
            row.querySelector('.btn-edit').onclick = () => openEditModal(p.uid);
            row.querySelector('.btn-ban').onclick = () => requestBanToggle(p.uid, p.locked);
            row.querySelector('.btn-promote').onclick = () => makeAdmin(p.uid);
            playerTbody.appendChild(row);
        }
    });
}

// ==========================================
// 4. DATA MANIPULATION (MOCK)
// ==========================================
function makeAdmin(uid) {
    showConfirm("Promote?", "User will become Level 1 Admin.", () => {
        const p = playersDB.find(x => x.uid === uid);
        if(p) p.adminlevel = 1;
        renderPlayerTable();
        showToast("User Promoted");
        closeConfirm();
    });
}

function fireAdmin(uid) {
    showConfirm("Demote?", "Admin will be removed.", () => {
        const p = playersDB.find(x => x.uid === uid);
        if(p) p.adminlevel = 0;
        renderPlayerTable();
        showToast("Admin Demoted");
        closeConfirm();
    });
}

function changeAdminLevel(uid, current, change) {
    const newLvl = current + change;
    if (newLvl < 1) return fireAdmin(uid);
    if (newLvl > 11) return showToast("Max Level", "red");
    
    const p = playersDB.find(x => x.uid === uid);
    if(p) p.adminlevel = newLvl;
    renderPlayerTable();
    showToast("Rank Updated");
}

function requestBanToggle(uid, locked) {
    const action = locked === 1 ? "Unban" : "Ban";
    showConfirm(`${action}?`, "Are you sure?", () => {
        const p = playersDB.find(x => x.uid === uid);
        if(p) p.locked = locked === 1 ? 0 : 1;
        renderPlayerTable();
        showToast("Status Updated");
        closeConfirm();
    });
}

// EDIT MODAL
function openEditModal(uid) {
    const p = playersDB.find(x => x.uid === uid);
    if(!p) return;
    document.getElementById('edit-id').value = p.uid;
    document.getElementById('edit-name').value = p.username;
    document.getElementById('edit-money').value = p.cash;
    document.getElementById('edit-level').value = p.level;
    document.getElementById('edit-admin').value = p.adminlevel;
    document.getElementById('edit-modal').style.display = 'flex';
}

function savePlayerChanges() {
    const uid = parseInt(document.getElementById('edit-id').value);
    const p = playersDB.find(x => x.uid === uid);
    if(p) {
        p.username = document.getElementById('edit-name').value;
        p.cash = parseInt(document.getElementById('edit-money').value);
        p.level = parseInt(document.getElementById('edit-level').value);
        p.adminlevel = parseInt(document.getElementById('edit-admin').value);
        showToast("Changes Saved!");
        renderPlayerTable();
    }
    closeModal();
}

// ==========================================
// 5. SUPABASE MOCK INTEGRATION
// ==========================================
async function loadCategories() {
    const { data } = await supabase.from('categories').select('*');
    const select = document.getElementById('rule-category-select');
    const list = document.getElementById('category-list');
    if(select) select.innerHTML = "";
    if(list) list.innerHTML = "";
    
    if(data) {
        data.forEach(cat => {
            if(select) select.innerHTML += `<option value="${cat.slug}">${cat.name}</option>`;
            if(list) list.innerHTML += `<div style="padding:5px; border-bottom:1px solid #333; display:flex; justify-content:space-between;">${cat.name} <i class="fa-solid fa-trash" style="color:red; cursor:pointer;" onclick="window.deleteCategory('${cat.slug}')"></i></div>`;
        });
    }
}

async function addCategory() {
    const name = document.getElementById('cat-name').value;
    const slug = document.getElementById('cat-slug').value.toLowerCase().replace(/\s+/g, '-');
    await supabase.from('categories').insert([{ name, slug }]);
    showToast("Category Created");
    loadCategories();
}

// Expose to window for inline onclicks in generated HTML
window.deleteCategory = async function(slug) {
    await supabase.from('categories').delete().eq('slug', slug);
    showToast("Category Deleted", "red");
    loadCategories();
}

async function renderRulesTable() {
    const { data } = await supabase.from('rules').select('*');
    const tbody = document.getElementById('rules-table-body');
    if(tbody) tbody.innerHTML = "";
    if(data) {
        data.forEach(rule => {
            tbody.innerHTML += `<tr><td>${rule.category}</td><td>${rule.title}</td><td>${rule.content}</td><td style="text-align:right;"><button class="action-btn btn-ban" onclick="window.deleteRule(${rule.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
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
    await supabase.from('rules').delete().eq('id', id);
    showToast("Rule Deleted");
    renderRulesTable();
}


// ==========================================
// 6. UTILITIES
// ==========================================
function toggleAdminMenu() {
    const sidebar = document.getElementById('adminSidebar');
    sidebar.classList.toggle('open');
    const overlay = document.querySelector('.mobile-overlay');
    if(overlay) overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
}

function showConfirm(title, msg, callback) {
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-text').innerText = msg;
    const btn = document.getElementById('confirm-yes-btn');
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', callback);
    document.getElementById('confirm-modal').style.display = 'flex';
}

function closeConfirm() { document.getElementById('confirm-modal').style.display = 'none'; }
function closeModal() { document.getElementById('edit-modal').style.display = 'none'; }

function showToast(msg, color="cyan") {
    const t = document.createElement('div');
    t.className = 'toast';
    if(color==="red") t.style.borderLeftColor="#ef4444";
    t.innerText = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
            }
