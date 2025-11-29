import { supabase } from './supabase.js';

// --- CONFIG ---
const CREDENTIALS = { user: "eight@admin9192", pass: "eight39" };
let db = []; // Player DB

// --- 1. LOGIN ---
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

// --- 2. SWITCH TABS ---
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
    
    // Close Mobile Menu
    const sidebar = document.getElementById('adminSidebar');
    if(sidebar) sidebar.classList.remove('open');
    const overlay = document.querySelector('.mobile-overlay');
    if(overlay) overlay.classList.remove('active');
}

// --- 3. CATEGORY MANAGER ---
window.loadCategories = async function() {
    const { data, error } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
    if (error) return console.error(error);

    const select = document.getElementById('rule-category-select');
    const list = document.getElementById('category-list');
    select.innerHTML = "";
    list.innerHTML = "";

    data.forEach(cat => {
        // Dropdown Option
        select.innerHTML += `<option value="${cat.slug}">${cat.name}</option>`;
        
        // List Item
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid #222;">
                <span style="color:#ccc; font-size:12px;">${cat.name}</span>
                <i class="fa-solid fa-trash" style="color:#ef4444; cursor:pointer;" onclick="deleteCategory('${cat.slug}')"></i>
            </div>
        `;
    });
}

window.addCategory = async function() {
    const name = document.getElementById('cat-name').value;
    const slug = document.getElementById('cat-slug').value.toLowerCase().replace(/\s+/g, '-');
    
    // Auto-generate order index based on current count
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
    if(!confirm("Delete category? This will delete ALL rules inside it.")) return;
    await supabase.from('categories').delete().eq('slug', slug);
    showToast("Category Deleted", "red");
    loadCategories();
    renderRulesTable();
}

// --- 4. RULE MANAGER ---
window.renderRulesTable = async function() {
    const { data, error } = await supabase.from('rules').select('*').order('category_slug', { ascending: true });
    if (error) return;

    const tbody = document.getElementById('rules-table-body');
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
            </tr>
        `;
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

// --- UTILS ---
window.showToast = function(msg, color="gold") {
    const t = document.createElement('div');
    t.className = 'toast';
    if(color==="red") t.style.borderLeftColor="#ef4444";
    t.innerHTML = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

window.toggleAdminMenu = function() {
    document.getElementById('adminSidebar').classList.toggle('open');
    document.querySelector('.mobile-overlay').classList.toggle('active');
}

window.logout = function() { location.reload(); }
