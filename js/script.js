/* =========================================
   NAVIGATION & MENU LOGIC
   ========================================= */
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
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active-view');
        // Reset animations so they play again when you come back
        view.querySelectorAll('.reveal').forEach(el => el.classList.remove('active'));
    });

    const target = document.getElementById(viewName + '-view');
    if(target) {
        target.classList.add('active-view');
        // Re-trigger animations for the new view
        setTimeout(() => triggerAnimations(), 100);
    }
    
    window.scrollTo(0,0);
}

/* =========================================
   SCROLL ANIMATIONS (Intersection Observer)
   ========================================= */
const observerOptions = {
    threshold: 0.15, // Trigger when 15% visible
    rootMargin: "0px 0px -50px 0px" // Trigger slightly before bottom
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

function triggerAnimations() {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    triggerAnimations();
    
    // Attach Event Listener to Form
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

/* =========================================
   PROFESSIONAL FORM HANDLING & TOAST
   ========================================= */
function handleFormSubmit(e) {
    e.preventDefault(); // Stop page reload
    
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;

    // 1. Loading State
    btn.innerText = "Sending...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    // 2. Simulate Server Delay (1.5 seconds)
    setTimeout(() => {
        // 3. Success State
        btn.innerText = "Message Sent!";
        btn.style.background = "#4CAF50"; // Green
        btn.style.color = "white";

        // 4. Show Professional Notification
        showToast("Success", "Your message has been sent to the team.");

        // 5. Reset Form
        e.target.reset();

        // 6. Reset Button after 3 seconds
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = ""; // Reset to CSS default
            btn.style.opacity = "1";
            btn.disabled = false;
        }, 3000);

    }, 1500);
}

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
