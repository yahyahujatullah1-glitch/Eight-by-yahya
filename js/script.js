// Mobile Menu Toggle
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    menu.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Scroll Reveal Animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
