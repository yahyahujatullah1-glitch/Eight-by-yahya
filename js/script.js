function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    menu.classList.toggle('open');
    overlay.classList.toggle('active');
}

function menuLink(viewName, hash = null) {
    toggleMenu(); // Close menu
    switchView(viewName); // Switch Page
    
    if(hash) {
        setTimeout(() => {
            const el = document.querySelector(hash);
            if(el) el.scrollIntoView({behavior: 'smooth'});
        }, 300); // Slight delay for smoother feel
    }
}

function switchView(viewName) {
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => view.classList.remove('active-view'));
    const target = document.getElementById(viewName + '-view');
    if(target) target.classList.add('active-view');
    window.scrollTo(0,0);
}

// Scroll Animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
