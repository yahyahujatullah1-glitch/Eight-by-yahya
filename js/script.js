// =========================================
// 1. MOBILE MENU TOGGLE
// =========================================
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    menu.classList.toggle('open');
    overlay.classList.toggle('active');
}

// =========================================
// 2. SMOOTH SCROLL & LINK HANDLING
// =========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Close mobile menu if open
            const menu = document.getElementById('sideMenu');
            if(menu.classList.contains('open')) toggleMenu();

            // Smooth scroll to target
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// =========================================
// 3. NAVBAR SCROLL EFFECT (Glassmorphism)
// =========================================
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// =========================================
// 4. SCROLL REVEAL ANIMATION (Professional Fade-In)
// =========================================
const observerOptions = {
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: Stop observing once revealed (better performance)
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply to all elements with .reveal class
document.addEventListener('DOMContentLoaded', () => {
    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach((el) => observer.observe(el));
});
