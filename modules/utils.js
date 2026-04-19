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

function showView(viewId, addToHistory = true) {
    // 1. STRICT AUTH GUARD: Protect Admin & Inventory routes!
    if (viewId === 'admin' || viewId === 'inventory') {
        // If they aren't logged in, or their email isn't the admin email, kick them out!
        if (currentUser !== 'admin@tinycrafts.com') {
            showToast("Access Denied. Admin privileges required.", "error");
            showView('landing', false); // Send them back to the home page
            return; 
        }
    }

    // 2. Protect the Profile route
    if (viewId === 'profile' && !currentUser) {
        showView('login', false);
        return;
    }

    // 1. Hide all views
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
        if(viewId === 'landing') {
            mainHeader.classList.add('hidden');
            mainHeader.classList.remove('minimal-nav');
        } else {
            mainHeader.classList.remove('hidden');
            
            const navLinks = mainHeader.querySelector('nav');
            if(navLinks) {
                if(viewId === 'login') {
                    navLinks.classList.add('hidden');
                    mainHeader.classList.remove('minimal-nav');
                } else if(viewId === 'about') {
                    // MINIMAL MODE: Show nav, but activate CSS to hide extra buttons!
                    navLinks.classList.remove('hidden');
                    mainHeader.classList.add('minimal-nav'); 
                } else {
                    navLinks.classList.remove('hidden');
                    mainHeader.classList.remove('minimal-nav');
                }
            }
        }
    }

    // 4. Handle Footer
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
    if (viewId === 'inventory') renderInventory(); 
    
    const cartTotalNav = document.getElementById('cart-total-nav');
    if(cartTotalNav) cartTotalNav.innerText = getCartTotal().toFixed(2);
    
    const wishCountNav = document.getElementById('wish-count');
    if(wishCountNav) wishCountNav.innerText = wishlist.length;
    
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

// Save email to database and check if they get an instant discount
function subscribeNewsletter(event) {
    event.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value.trim().toLowerCase();

    if (!email) return;

    db.collection("subscribers").doc(email).set({
        subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showToast("Subscribed! 10% off applied to your account.", "success");
        emailInput.value = '';
        
        // If they are currently logged in with this email, apply the discount instantly!
        if (currentUser && currentUser.toLowerCase() === email) {
            isSubscriber = true;
            if(typeof applyPromo === 'function') applyPromo(); 
        }
    })
    .catch(err => {
        console.error("Subscription error:", err);
        showToast("Error subscribing. Please try again.", "error");
    });
}

// NEW: Classic Dropdown Mobile Menu Logic
function toggleMobileMenu(forceClose = false) {
    const nav = document.getElementById('mobile-nav');
    const icon = document.querySelector('.mobile-menu-btn i');
    
    if (!nav || !icon) return;

    if (forceClose || nav.classList.contains('active')) {
        nav.classList.remove('active');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    } else {
        nav.classList.add('active');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    }
}

// --- FORM INPUT VALIDATION HELPERS --- //

// 1. Blocks numbers and symbols. Only allows letters and spaces (For Names)
function validateNameInput(inputField) {
    // The regex /[^a-zA-Z\s]/g means: "Find anything that is NOT a letter or space, and delete it"
    inputField.value = inputField.value.replace(/[^a-zA-Z\s]/g, '');
}

// 2. Blocks letters and symbols. Only allows numbers (For Card Numbers, CVV, Phone)
// Bonus: This automatically adds a space after every 4 digits for credit cards!
function formatCardNumber(inputField) {
    // First, strip out anything that isn't a number (\D)
    let rawNumbers = inputField.value.replace(/\D/g, '');
    
    // Then, add a space after every 4 digits for that classic credit card look
    let formatted = rawNumbers.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Update the field!
    inputField.value = formatted;
}

// 3. Strict Number Only (For things like CVV or Expiry where you don't want spaces)
function validateStrictNumber(inputField) {
    inputField.value = inputField.value.replace(/\D/g, '');
}

// --- SMART FORM SUBMISSION --- //
function proceedToReview(event) {
    // 1. Stop the button from accidentally refreshing the page
    if (event) event.preventDefault(); 
    
    // 2. Find your checkout form (Make sure your <form> tag has id="checkout-form")
    const form = document.getElementById('checkout-form'); 
    
    if (!form) return;

    // 3. Ask the HTML if all 'required' fields are filled out correctly
    if (form.checkValidity()) {
        // If everything is perfect, move to the review page!
        nextCheckoutStep(3);
    } else {
        // If something is missing, force the browser to show the red error popups!
        form.reportValidity(); 
    }
}