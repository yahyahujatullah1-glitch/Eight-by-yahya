// =========================================
// 1. MOBILE MENU TOGGLE
// =========================================
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    
    // Safety check to prevent errors if elements are missing
    if (menu && overlay) {
        menu.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

// =========================================
// 2. SMART NAVIGATION (Clean URL & Cross-Page Support)
// =========================================
// This handles links like href="#features" or href="/#features"
document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Ignore empty hashes or purely external links that don't point to ID
        if (href === '#' || !href.includes('#')) return;

        // Extract the ID part (e.g., "features" from "/#features")
        const hash = href.substring(href.indexOf('#')); 
        const targetElement = document.querySelector(hash);

        // Check if we are currently on the Homepage
        // (Works for "/", "/index", and "/index.html")
        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/' || currentPath.endsWith('/index') || currentPath.endsWith('/index.html');

        if (isHomePage && targetElement) {
            // CASE A: We are on Home -> Smooth Scroll
            e.preventDefault(); // Stop the hard jump/reload

            // Close mobile menu if it's open
            const menu = document.getElementById('sideMenu');
            if (menu && menu.classList.contains('open')) {
                toggleMenu();
            }

            // Smooth scroll to target
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Update URL hash cleanly without reloading
            history.pushState(null, null, hash);
        } 
        else if (!isHomePage) {
            // CASE B: We are on a Sub-page (e.g., /privacy)
            // Allow default behavior (browser will navigate to "/" + "#features")
            // No e.preventDefault() here.
        }
    });
});

// =========================================
// 3. NAVBAR SCROLL EFFECT (Glassmorphism)
// =========================================
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
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
            // Stop observing once revealed to save performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply to all elements with .reveal class
document.addEventListener('DOMContentLoaded', () => {
    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach((el) => observer.observe(el));
});
