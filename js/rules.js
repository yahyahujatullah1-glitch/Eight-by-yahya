import { supabase } from './supabase.js';

const CATEGORY_TITLES = {
    general: "1. General Server Rules",
    roleplay: "2. Roleplay Terms",
    crimes: "3. Criminal Activities",
    zones: "4. Safe Zones",
    admin: "5. Admin Policy"
};

let allRulesData = [];

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('rules-content-area');
    
    // 1. Show Loading State
    if(container) container.innerHTML = '<p style="color:#888; text-align:center; margin-top:50px;">Connecting to Rulebook...</p>';

    // 2. Fetch Rules
    const { data, error } = await supabase
        .from('rules')
        .select('*')
        .order('id', { ascending: true });

    // 3. Handle Errors
    if (error) {
        console.error("Supabase Error:", error);
        container.innerHTML = `<p style="color:red; text-align:center;">Error loading rules: ${error.message}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:#aaa; text-align:center;">Database connected, but no rules found. Add some via Admin Panel.</p>';
        return;
    }

    // 4. Success - Render
    allRulesData = data;
    renderCategory('general'); // Default tab

    // 5. Setup Buttons
    document.querySelectorAll('.rule-tab').forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.getAttribute('data-category');
            switchTab(category, e.target);
        });
    });
});

function renderCategory(category) {
    const container = document.getElementById('rules-content-area');
    const filteredRules = allRulesData.filter(rule => rule.category === category);
    const title = CATEGORY_TITLES[category] || category.toUpperCase();
    
    let html = `<h2 class="rule-head reveal">${title}</h2>`;

    if (filteredRules.length === 0) {
        html += `<div class="rule-box reveal"><p style="color:#666;">No rules added to this section yet.</p></div>`;
    } else {
        filteredRules.forEach((rule, index) => {
            html += `
                <div class="rule-box reveal" style="animation-delay: ${index * 0.1}s">
                    <h4 style="color:white; font-size:18px; margin-bottom:10px;">${rule.title}</h4>
                    <p style="color:#ccc; font-size:14px; line-height:1.6;">${rule.content}</p>
                </div>
            `;
        });
    }

    container.innerHTML = html;
    
    // Trigger Animations
    setTimeout(() => {
        container.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }, 50);
}

function switchTab(category, clickedBtn) {
    document.querySelectorAll('.rule-tab').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    renderCategory(category);
    
    if (window.innerWidth < 768) {
        const container = document.getElementById('rules-content-area');
        const y = container.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}
