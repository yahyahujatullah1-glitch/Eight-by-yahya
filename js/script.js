// Function to toggle the slide-out menu
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    menu.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Function to handle clicking a link inside the menu
function menuLink(viewName, hash = null) {
    toggleMenu(); // Close the menu first
    switchView(viewName); // Switch to the correct "page" (View)
    
    if(hash) {
        // If there's a specific section (like #team), scroll to it after a slight delay
        setTimeout(() => {
            const el = document.querySelector(hash);
            if(el) el.scrollIntoView({behavior: 'smooth'});
        }, 100);
    }
}

// Function to switch between Home, Terms, Privacy, etc.
function switchView(viewName) {
    // Hide all sections
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => view.classList.remove('active-view'));
    
    // Show the target section
    const target = document.getElementById(viewName + '-view');
    if(target) target.classList.add('active-view');
    
    // Scroll to top instantly
    window.scrollTo(0,0);
}

// Scroll Animation Observer (Makes elements fade in as you scroll)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

// Start observing all elements with class 'reveal'
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
