// =========================================================
// UTILITIES MODULE
// Toast notifications, Modals, Theme toggle, Navigation
// =========================================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    let color = type === 'success' ? 'var(--white)' : 'var(--white)';
    toast.innerHTML = `<i class="fas ${icon}" style="margin-right:10px; font-size:1.2rem; color:${color}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function closeModal(id) { 
    document.getElementById(id).classList.add('hidden'); 
}

function openModal(id) { 
    document.getElementById(id).classList.remove('hidden'); 
}

function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('kcTheme', isDark ? 'light' : 'dark');
    document.getElementById('theme-btn').innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// Load theme from localStorage on page load
if (localStorage.getItem('kcTheme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('theme-btn').innerHTML = '<i class="fas fa-sun"></i>';
}

function showView(viewId, addToHistory = true) {
    // 1. Hide all views (Now includes 'inventory-view')
    ['landing-view', 'login-view', 'shop-view', 'cart-view', 'checkout-view', 'profile-view', 'wishlist-view', 'admin-view', 'inventory-view', 'about-view'].forEach(v => { 
        const el = document.getElementById(v);
        if(el) el.classList.add('hidden'); 
    });
    
    // 2. Show requested view
    const target = document.getElementById(viewId + '-view');
    if(target) target.classList.remove('hidden');
    
    // 3. Handle Header
    const mainHeader = document.getElementById('main-header');
    if(mainHeader) {
        // REMOVED 'login' from this list!
        if(viewId === 'landing' || viewId === 'about') {
            mainHeader.classList.add('hidden');
        } else {
            mainHeader.classList.remove('hidden');
        }
    }

    // 4. Handle Footer (Hides on Admin & Inventory)
    const mainFooter = document.querySelector('footer');
    if(mainFooter) {
        if(viewId === 'admin' || viewId === 'inventory') {
            mainFooter.classList.add('hidden');
        } else {
            mainFooter.classList.remove('hidden');
        }
    }
    
    // 5. Run page-specific logic
    if (viewId === 'shop') filterProducts();
    if (viewId === 'cart') renderCart();
    if (viewId === 'profile') renderProfile();
    if (viewId === 'wishlist') renderWishlist();
    if (viewId === 'admin') renderAdmin();
    if (viewId === 'inventory') renderInventory(); // Triggers the new page!
    
    document.getElementById('cart-total-nav').innerText = getCartTotal().toFixed(2);
    document.getElementById('wish-count').innerText = wishlist.length;
    
    window.scrollTo(0,0);

    if (addToHistory) {
        window.history.pushState(null, null, `#${viewId}`);
    }
}

// Handle browser back button
window.addEventListener('hashchange', () => {
    const path = window.location.hash.slice(1) || 'landing';
    showView(path, false);
});

document.addEventListener("DOMContentLoaded", () => {
    // Look at the URL. If it says #shop, load shop. If empty, load landing.
    let initialView = window.location.hash.substring(1) || 'landing';
    showView(initialView, false);
});