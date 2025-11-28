function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    
    if (menu && overlay) {
        menu.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href.includes('#')) return;
        const hash = href.substring(href.indexOf('#')); 
        const targetElement = document.querySelector(hash);
        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/' || currentPath.endsWith('/index') || currentPath.endsWith('/index.html');

        if (isHomePage && targetElement) {
            e.preventDefault();
            const menu = document.getElementById('sideMenu');
            if (menu && menu.classList.contains('open')) toggleMenu();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, null, hash);
        } 
    });
});

window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    }
});

const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach((el) => observer.observe(el));
});// --- ROADMAP ANIMATION TRIGGER ---
const roadmapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const timeline = entry.target.querySelector('.timeline');
            if (timeline) timeline.classList.add('animate-line');

            const items = entry.target.querySelectorAll('.time-item');
            items.forEach(item => item.classList.add('show'));
            
            roadmapObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.addEventListener('DOMContentLoaded', () => {
    const roadmapSection = document.querySelector('#roadmap');
    if (roadmapSection) roadmapObserver.observe(roadmapSection);
});
