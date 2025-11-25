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
        }, 200);
    }
}

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active-view');
    });

    // Show target view
    const target = document.getElementById(viewName + '-view');
    if(target) {
        target.classList.add('active-view');
    }
    
    // Scroll to top
    window.scrollTo(0,0);
}

// Reveal Animation on Scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});}

// Custom Notification Function
function showToast(title, message) {
    const container = document.getElementById('toast-container');
    
    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    // Add to screen
    container.appendChild(toast);

    // Remove after 4 seconds (Slide out)
    setTimeout(() => {
        toast.style.animation = "slideOut 0.5s forwards";
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 4000);
}
