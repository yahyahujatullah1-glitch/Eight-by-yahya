import { supabase } from './supabase.js';

// Configuration: Map database slugs to display titles
const CATEGORY_TITLES = {
    general: "1. General Server Rules",
    roleplay: "2. Roleplay Terms & definitions",
    crimes: "3. Criminal Activities",
    zones: "4. Safe Zones (Green Zones)",
    admin: "5. Administration Policy"
};

let allRulesData = [];

// --- 1. INITIALIZE ---
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state
    const container = document.getElementById('rules-content-area');
    if(container) container.innerHTML = '<p style="color:#888; text-align:center; margin-top:50px;">Loading rulebook...</p>';

    await fetchRules();
    
    // Setup Tab Clicks
    document.querySelectorAll('.rule-tab').forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.getAttribute('data-category');
            switchTab(category, e.target);
        });
    });
});

// --- 2. FETCH DATA FROM SUPABASE ---
async function fetchRules() {
    const { data, error } = await supabase
        .from('rules')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error loading rules:", error);
        document.getElementById('rules-content-area').innerHTML = '<p style="color:#ef4444;">Failed to load rules. Please try again later.</p>';
        return;
    }

    allRulesData = data;
    
    // Render default category (General)
    renderCategory('general');
    
    // Set default active tab
    const defaultTab = document.querySelector('[data-category="general"]');
    if(defaultTab) defaultTab.classList.add('active');
}

// --- 3. RENDER RULES ---
function renderCategory(category) {
    const container = document.getElementById('rules-content-area');
    const filteredRules = allRulesData.filter(rule => rule.category === category);
    
    // Get Title
    const title = CATEGORY_TITLES[category] || category.toUpperCase();
    
    let html = `<h2 class="rule-head reveal">${title}</h2>`;

    if (filteredRules.length === 0) {
        html += `<div class="rule-box reveal"><p style="color:#666;">No rules found in this section yet.</p></div>`;
    } else {
        filteredRules.forEach((rule, index) => {
            // Stagger animation delay
            const delay = index * 0.1; 
            html += `
                <div class="rule-box reveal" style="animation-delay: ${delay}s">
                    <h4>${rule.title}</h4>
                    <p>${rule.content}</p>
                </div>
            `;
        });
    }

    container.innerHTML = html;
    
    // Re-trigger animations
    const newElements = container.querySelectorAll('.reveal');
    newElements.forEach(el => {
        el.style.opacity = '0';
        setTimeout(() => el.classList.add('active'), 50);
    });
}

// --- 4. SWITCH TABS ---
function switchTab(category, clickedBtn) {
    // Update Sidebar UI
    document.querySelectorAll('.rule-tab').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    // Render Content
    renderCategory(category);

    // Scroll to top on mobile
    if (window.innerWidth < 768) {
        const container = document.getElementById('rules-content-area');
        const yOffset = -100; // Offset for navbar
        const y = container.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}
