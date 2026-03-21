// =========================================================
// 1. FIREBASE CONFIGURATION & LOCAL CACHE RESET
// =========================================================
const APP_VERSION = "8.3";
if(localStorage.getItem('kcVersion') !== APP_VERSION) {
    localStorage.removeItem('kcProducts');
    localStorage.setItem('kcVersion', APP_VERSION);
}

const firebaseConfig = {
  apiKey: "AIzaSyB9UUGburEXWnRXXIozEM4et1J8rMzMW-s",
  authDomain: "tiny-crafts-b37e6.firebaseapp.com",
  projectId: "tiny-crafts-b37e6",
  storageBucket: "tiny-crafts-b37e6.firebasestorage.app",
  messagingSenderId: "358810305252",
  appId: "1:358810305252:web:b8007382e50af6acc0a2f1",
  measurementId: "G-25N130SF5M"
};

let auth, db;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.firestore();
} catch(e) {
    console.warn("Firebase failed to initialise — running in offline/local mode.", e);
    // Provide stub so auth calls don't throw
    auth = {
        onAuthStateChanged: (cb) => cb(null),
        signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase unavailable")),
        createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase unavailable")),
        signInWithPopup: () => Promise.reject(new Error("Firebase unavailable")),
        signOut: () => Promise.resolve(),
        currentUser: null
    };
    db = null;
}

// =========================================================
// 2. STATE MANAGEMENT & LOCAL DATA
// =========================================================
let cart = JSON.parse(localStorage.getItem('kcCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('kcWishlist')) || [];
let orderHistory = JSON.parse(localStorage.getItem('kcOrders')) || [];
let discountMultiplier = 1;
let currentUser = null; 
let activeProductId = null;

const defaultProducts = [
    { id: 1, name: "Baby Penguin Felt Keyring", cat: "Animals", price: 12.00, stock: 20, desc: "An adorable hand-felted baby penguin to keep you company.", img: "images/baby.jpg", reviews: [] },
    { id: 2, name: "Happy Hedgehog Keyring", cat: "Animals", price: 14.00, stock: 15, desc: "A spiky but soft felted hedgehog friend.", img: "images/hedgehog.jpg", reviews: [] },
    { id: 3, name: "Panda with Bamboo", cat: "Animals", price: 15.00, stock: 10, desc: "Cute needle-felted panda holding a fresh bamboo shoot.", img: "images/panda.jpg", reviews: [] },
    { id: 4, name: "Sweet Cupcake Keyring", cat: "Food & Plants", price: 10.00, stock: 25, desc: "Pink frosted cupcake with a cherry on top. Zero calories!", img: "images/keyring4.jpg", reviews: [] },
    { id: 5, name: "Classic Teddy Bear", cat: "Animals", price: 12.50, stock: 30, desc: "A timeless, tiny brown teddy bear keychain.", img: "images/keyring2.jpg", reviews: [] },
    { id: 6, name: "Electric Mouse Keyring", cat: "Pop Culture & Fun", price: 16.00, stock: 20, desc: "Catch this familiar yellow electric friend for your keys.", img: "images/keyring3.jpg", reviews: [] },
    { id: 7, name: "Hanging Sloth", cat: "Animals", price: 14.50, stock: 18, desc: "Take it easy with this smiling sloth hanging from your bag.", img: "images/sloth.jpg", reviews: [] },
    { id: 8, name: "Evil Eye Charm", cat: "Symbols & Charms", price: 9.00, stock: 40, desc: "Protect your energy with this traditional blue evil eye.", img: "images/keyring.jpg", reviews: [] },
    { id: 9, name: "Woodland Fox Combo", cat: "Animals", price: 15.00, stock: 15, desc: "A clever little fox ready for daily adventures.", img: "images/banner6.jpg", reviews: [] },
    { id: 10, name: "Happy Avocado", cat: "Food & Plants", price: 11.00, stock: 22, desc: "A smiling avocado half. The perfect toast companion.", img: "images/banner5.jpg", reviews: [] },
    { id: 11, name: "Retro Hot Air Balloon", cat: "Symbols & Charms", price: 13.00, stock: 12, desc: "Float away with this colorful striped balloon.", img: "images/banner5.jpg", reviews: [] },
    { id: 12, name: "Fluffy Farm Sheep", cat: "Animals", price: 12.00, stock: 19, desc: "A super soft, textured sheep straight from the farm.", img: "images/banner5.jpg", reviews: [] },
    { id: 13, name: "Potted Cactus Emoji", cat: "Food & Plants", price: 10.50, stock: 24, desc: "A prickle-free smiling cactus in a tiny pot.", img: "images/banner6.jpg", reviews: [] },
    { id: 14, name: "Ocean Blue Whale", cat: "Animals", price: 13.50, stock: 16, desc: "A deep blue whale making a splash on your keyring.", img: "images/banner6.jpg", reviews: [] },
    { id: 15, name: "Sleepy Baby Sloth", cat: "Animals", price: 14.50, stock: 10, desc: "Another variation of our favorite slow-moving buddy.", img: "images/sloth.jpg", reviews: [] },
    { id: 16, name: "Red Cherry Cupcake", cat: "Food & Plants", price: 10.00, stock: 14, desc: "Deliciously cute felted bakery treat.", img: "images/keyring4.jpg", reviews: [] },
    { id: 17, name: "Bamboo Muncher Panda", cat: "Animals", price: 15.00, stock: 8, desc: "Detailed panda bear snacking on his favorite green plant.", img: "images/panda.jpg", reviews: [] },
    { id: 18, name: "Protective Eye Amulet", cat: "Symbols & Charms", price: 9.00, stock: 30, desc: "A vibrant blue talisman for good luck.", img: "images/keyring.jpg", reviews: [] },
    { id: 19, name: "Fuzzy Brown Bear", cat: "Animals", price: 12.50, stock: 11, desc: "Your standard, lovable fuzzy companion.", img: "images/keyring2.jpg", reviews: [] },
    { id: 20, name: "Spark Mouse", cat: "Pop Culture & Fun", price: 16.00, stock: 9, desc: "A nostalgic favorite for retro game fans.", img: "images/keyring3.jpg", reviews: [] }
];

let products = JSON.parse(localStorage.getItem('kcProducts')) || defaultProducts;

// =========================================================
// 2.5 AGILE SPRINT & CRITICAL PATH TRACKER LOGIC
// =========================================================
const projectTasks = [
    { id: 1, name: "1.1 UI/UX Design & Wireframing", sprint: "Sprint 1", float: 2, status: "Done" },
    { id: 2, name: "1.2 HTML/CSS Frontend UI", sprint: "Sprint 1", float: 0, status: "Done" },
    { id: 3, name: "2.1 Firebase Auth Integration", sprint: "Sprint 2", float: 0, status: "Done" },
    { id: 4, name: "2.2 Node.js Backend Routing", sprint: "Sprint 2", float: 0, status: "In Progress" },
    { id: 5, name: "3.1 Populate 20 Store Products", sprint: "Sprint 3", float: 5, status: "To Do" },
    { id: 6, name: "3.2 Testing & Critical Path Review", sprint: "Sprint 3", float: 0, status: "To Do" },
    { id: 7, name: "3.3 Final Report Documentation", sprint: "Sprint 3", float: 2, status: "To Do" }
];

function renderSprintTracker() {
    const tbody = document.getElementById('sprint-tracker-list');
    if(!tbody) return;
    tbody.innerHTML = projectTasks.map(t => {
        const isCritical = t.float === 0;
        const criticalBadge = isCritical ? `<span style="background:var(--error-red); color:white; padding:4px 8px; border-radius:12px; font-size:0.75rem; font-weight:bold;">YES (Zero Float)</span>` : `<span style="color:var(--text-gray); font-weight:bold;">No</span>`;
        
        let statusColor = "var(--text-gray)";
        if(t.status === "Done") statusColor = "var(--primary-color)";
        if(t.status === "In Progress") statusColor = "#fca311";

        return `<tr>
            <td style="font-weight:bold; color:var(--text-dark);">${t.name}</td>
            <td>${t.sprint}</td>
            <td>${t.float} Days</td>
            <td style="color:${statusColor}; font-weight:bold;">${t.status}</td>
            <td>${criticalBadge}</td>
        </tr>`;
    }).join('');
}

// =========================================================
// 3. SECURE AUTHENTICATION LOGIC
// =========================================================
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user.email;
        document.getElementById('profile-name-nav').innerText = user.displayName || user.email.split('@')[0];
        document.getElementById('profile-name-display-card').innerText = user.displayName || user.email.split('@')[0];
        
        const adminBtn = document.getElementById('admin-nav-btn');
        if (user.email === "admin@keyringcrafters.com" || user.email === "admin@tinycrafts.com") {
            adminBtn.classList.remove('hidden');
            adminBtn.style.display = 'flex';
        } else {
            adminBtn.classList.add('hidden');
            adminBtn.style.display = 'none';
        }
    } else {
        currentUser = null;
        document.getElementById('profile-name-nav').innerText = "Sign In";
        document.getElementById('admin-nav-btn').classList.add('hidden');
    }
});

const authContainer = document.getElementById('auth-container');
document.getElementById('signUpBtn')?.addEventListener('click', () => { if(authContainer) authContainer.classList.add("right-panel-active"); });
document.getElementById('signInBtn')?.addEventListener('click', () => { if(authContainer) authContainer.classList.remove("right-panel-active"); });

function toggleMobileAuth(event, isSignUp) { 
    if(event) event.preventDefault(); 
    if(authContainer) {
        isSignUp ? authContainer.classList.add("right-panel-active") : authContainer.classList.remove("right-panel-active"); 
    }
}

function registerUser(event) {
    event.preventDefault(); 
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    
    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => {
            showToast("Account created successfully!", "success");
            toggleMobileAuth(event, false); 
        })
        .catch((error) => { showToast(error.message, "error"); });
}

function loginUser(event) {
    event.preventDefault(); 
    const email = document.getElementById('login-user').value.trim(); 
    const pass = document.getElementById('login-pass').value.trim();
    
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            showToast(`Welcome back, ${email.split('@')[0]}!`, "success");
            showView('shop');
        })
        .catch((error) => { showToast(error.message, "error"); });
}

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
    .then((result) => {
        currentUser = result.user.email;
        showToast(`Welcome via Google, ${result.user.displayName}!`, "success");
        showView('shop');
    }).catch((error) => {
        showToast(error.message, "error");
    });
}

function signInWithFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider)
    .then((result) => {
        currentUser = result.user.email;
        showToast(`Welcome via Facebook, ${result.user.displayName}!`, "success");
        showView('shop');
    }).catch((error) => {
        showToast("Facebook login: Make sure it's enabled in Firebase Console. " + error.message, "error");
    });
}

function signInWithGitHub() {
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider)
    .then((result) => {
        currentUser = result.user.email;
        showToast(`Welcome via GitHub, ${result.user.displayName}!`, "success");
        showView('shop');
    }).catch((error) => {
        showToast("GitHub login: Make sure it's enabled in Firebase Console. " + error.message, "error");
    });
}

function mockSocialLogin(platform) {
    currentUser = platform.toLowerCase() + "_user@tinycrafts.com";
    document.getElementById('profile-name-nav').innerText = platform + " User";
    document.getElementById('profile-name-display-card').innerText = platform + " User";
    showToast(`Authenticated via ${platform}! (Mocked for Prototype)`, "success");
    showView('shop');
}

function logout() {
    auth.signOut().then(() => {
        currentUser = null;
        cart = [];
        wishlist = [];
        document.getElementById('cart-total-nav').innerText = "0.00";
        document.getElementById('wish-count').innerText = "0";
        if(authContainer) authContainer.classList.remove("right-panel-active"); 
        showToast("Logged out successfully.", "success");
        showView('landing');
    }).catch(() => {
        currentUser = null;
        showView('landing');
    });
}

// =========================================================
// 4. UI HELPERS & NAVIGATION & HASH ROUTING
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

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }

function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('kcTheme', isDark ? 'light' : 'dark');
    document.getElementById('theme-btn').innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

if (localStorage.getItem('kcTheme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('theme-btn').innerHTML = '<i class="fas fa-sun"></i>';
}

function showView(viewId, addToHistory = true) {
    ['landing-view', 'login-view', 'shop-view', 'cart-view', 'checkout-view', 'profile-view', 'wishlist-view', 'admin-view', 'about-view'].forEach(v => { 
        const el = document.getElementById(v);
        if(el) el.classList.add('hidden'); 
    });
    
    const target = document.getElementById(viewId + '-view');
    if(target) target.classList.remove('hidden');
    
    const mainHeader = document.getElementById('main-header');
    if(mainHeader) {
        if(viewId === 'landing' || viewId === 'login' || viewId === 'about') {
            mainHeader.classList.add('hidden');
        } else {
            mainHeader.classList.remove('hidden');
        }
    }
    
    if (viewId === 'shop') filterProducts();
    if (viewId === 'cart') renderCart();
    if (viewId === 'profile') renderProfile();
    if (viewId === 'wishlist') renderWishlist();
    if (viewId === 'admin') renderAdmin();
    
    document.getElementById('cart-total-nav').innerText = getCartTotal().toFixed(2);
    document.getElementById('wish-count').innerText = wishlist.length;
    
    window.scrollTo(0,0);

    if (addToHistory) {
        window.history.pushState(null, null, `#${viewId}`);
    }
}

// =========================================================
// 5. FETCH FROM BACKEND: SHOP & LIVE SEARCH
// =========================================================
function handleLiveSearch(event) {
    const val = event.target.value.toLowerCase();
    const dropdown = document.getElementById('autocomplete-dropdown');
    if(!dropdown) return;
    dropdown.innerHTML = '';
    if (!val) { filterProducts(); return; }
    
    const matches = products.filter(p => p.name.toLowerCase().includes(val)).slice(0, 5);
    matches.forEach(p => {
        dropdown.innerHTML += `
            <div class="autocomplete-item" onclick="openProductModal('${p.id}'); document.getElementById('search-input').value=''; document.getElementById('autocomplete-dropdown').innerHTML='';">
                <img src="${p.img}" onerror="this.src='https://placehold.co/40'"> 
                <span>${p.name}</span> 
                <span style="margin-left:auto; color:var(--primary-color); font-weight:bold;">£${Number(p.price).toFixed(2)}</span>
            </div>`;
    });
    filterProducts();
}

document.addEventListener('click', (e) => {
    if(!e.target.closest('.controls')) {
        const dp = document.getElementById('autocomplete-dropdown');
        if(dp) dp.innerHTML = '';
    }
});

function renderProducts(list, containerId = 'product-list') {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    container.innerHTML = '';
    if(list.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-gray); grid-column: 1/-1;">No tiny crafts found.</p>';
        return;
    }
    
    list.forEach(p => {
        const isWished = wishlist.includes(String(p.id));
        container.innerHTML += `
            <div class="card">
                <button class="heart-btn ${isWished ? 'active' : ''}" onclick="toggleWishlist('${p.id}', event)">
                    <i class="${isWished ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <img src="${p.img}" alt="${p.name}" onerror="this.src='baby.jpg'" onclick="openProductModal('${p.id}')">
                <div class="category">${p.cat}</div>
                <div class="title" style="font-weight:bold; font-size:1.1rem; cursor:pointer; font-family:'Poppins', sans-serif;" onclick="openProductModal('${p.id}')">${p.name}</div>
                <div class="price">£${Number(p.price).toFixed(2)}</div>
                <button class="btn-primary" onclick="addToCart('${p.id}', event)" ${p.stock === 0 ? 'disabled' : ''}>Add to Basket</button>
            </div>`;
    });
}

function filterProducts() {
    const catEl = document.getElementById('cat-filter');
    const searchEl = document.getElementById('search-input');
    const sortEl = document.getElementById('sort-filter');
    const sliderEl = document.getElementById('price-slider');
    
    const cat = catEl ? catEl.value : 'all';
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    const sort = sortEl ? sortEl.value : 'default';
    const maxPrice = sliderEl ? parseFloat(sliderEl.value) : Infinity;

    // FETCH PRODUCTS FROM NODE API (server.js)
    fetch('http://localhost:3000/api/products')
    .then(response => {
        if(!response.ok) throw new Error("API not running");
        return response.json();
    })
    .then(cloudProducts => {
        if(cloudProducts.length === 0) cloudProducts = defaultProducts;

        let filtered = cloudProducts.filter(p => 
            (cat === 'all' || p.cat === cat) && 
            p.name.toLowerCase().includes(search) &&
            p.price <= maxPrice
        );
        
        if (sort === 'low') filtered.sort((a,b) => a.price - b.price);
        if (sort === 'high') filtered.sort((a,b) => b.price - a.price);
        
        products = cloudProducts; 
        renderProducts(filtered);
    })
    .catch(error => {
        // Local fallback if Node.js server is offline
        let filtered = defaultProducts.filter(p => 
            (cat === 'all' || p.cat === cat) && 
            p.name.toLowerCase().includes(search) &&
            p.price <= maxPrice
        );
        if (sort === 'low') filtered.sort((a,b) => a.price - b.price);
        if (sort === 'high') filtered.sort((a,b) => b.price - a.price);
        products = defaultProducts;
        renderProducts(filtered);
    });
}

// =========================================================
// 6. MODAL & REVIEWS
// =========================================================
function openProductModal(id) {
    const p = products.find(x => String(x.id) === String(id));
    if(!p) return;
    activeProductId = id;
    
    document.getElementById('modal-img').src = p.img;
    document.getElementById('modal-cat').innerText = p.cat;
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-desc').innerText = p.desc || "A lovely craft addition.";
    document.getElementById('modal-price').innerText = `£${Number(p.price).toFixed(2)}`;
    
    const btn = document.getElementById('modal-add-btn');
    btn.onclick = (e) => { addToCart(p.id, e); closeModal('product-modal'); };
    btn.disabled = p.stock === 0;
    btn.innerText = p.stock === 0 ? "Out of Stock" : "Add to Basket";
    
    renderReviews(p);
    renderRelatedProducts(p);
    openModal('product-modal');
}

function renderRelatedProducts(currentProduct) {
    const container = document.getElementById('related-products');
    container.innerHTML = '';
    const related = products.filter(p => p.cat === currentProduct.cat && String(p.id) !== String(currentProduct.id)).slice(0, 4);
    
    if(related.length === 0) return;
    
    related.forEach(p => {
        container.innerHTML += `
            <div style="min-width: 150px; background: var(--input-bg); border-radius: 12px; padding: 10px; cursor: pointer; transition: 0.2s; border: 1px solid transparent;" onmouseover="this.style.borderColor='var(--primary-color)'" onmouseout="this.style.borderColor='transparent'" onclick="openProductModal('${p.id}')">
                <img src="${p.img}" onerror="this.src='https://placehold.co/150'" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
                <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                <div style="font-size: 0.85rem; color: var(--primary-color); font-weight:bold;">£${Number(p.price).toFixed(2)}</div>
            </div>`;
    });
}

function renderReviews(product) {
    const list = document.getElementById('reviews-list');
    list.innerHTML = '';
    if (!product.reviews || product.reviews.length === 0) {
        list.innerHTML = '<p style="color:var(--text-gray); font-size: 0.9rem;">No reviews yet. Be the first to review!</p>';
    } else {
        product.reviews.forEach(r => {
            const stars = '⭐'.repeat(r.rating);
            list.innerHTML += `<div style="background:var(--input-bg); padding:15px; border-radius:12px; margin-bottom:10px; color:var(--text-dark);">
                <strong style="display:block; margin-bottom:5px; font-family:'Poppins', sans-serif;">${r.user} <span style="color:#FFB26B; font-size:0.9rem;">${stars}</span></strong>
                <span style="font-size: 0.9rem;">${r.text}</span>
            </div>`;
        });
    }
}

function submitReview() {
    const textEl = document.getElementById('review-text');
    const ratingEl = document.getElementById('review-rating');
    const text = textEl.value;
    const rating = ratingEl.value;
    
    if (!text) return showToast("Please write a review.", "error");
    if (!currentUser) return showToast("Please Sign In to review", "error");
    
    const p = products.find(prod => String(prod.id) === String(activeProductId));
    if (!p.reviews) p.reviews = [];
    p.reviews.push({ user: currentUser, rating: parseInt(rating), text: text });
    
    localStorage.setItem('kcProducts', JSON.stringify(products));
    textEl.value = '';
    renderReviews(p); 
    showToast("Review posted! (Locally)", "success");
}

// =========================================================
// 7. CART SYSTEM
// =========================================================
function addToCart(id, event) {
    if(!currentUser) {
        showToast("Please Sign In first.", "error");
        showView('login');
        return;
    }

    const p = products.find(x => String(x.id) === String(id));
    const inCart = cart.find(i => String(i.id) === String(id));
    
    if ((inCart ? inCart.qty : 0) >= p.stock) return showToast(`Only ${p.stock} in stock!`, "error");
    if (inCart) inCart.qty++; else cart.push({...p, qty: 1});
    
    localStorage.setItem('kcCart', JSON.stringify(cart));
    document.getElementById('cart-total-nav').innerText = getCartTotal().toFixed(2); 
    showToast(p.name + " added to basket!", "success");
}

function toggleWishlist(id, event) {
    event.stopPropagation();
    if(!currentUser) return showToast("Please Sign In first.", "error");
    
    const idx = wishlist.indexOf(String(id));
    if (idx > -1) { wishlist.splice(idx, 1); showToast("Removed from wishlist."); } 
    else { wishlist.push(String(id)); showToast("Added to wishlist!", "success"); }
    
    localStorage.setItem('kcWishlist', JSON.stringify(wishlist));
    document.getElementById('wish-count').innerText = wishlist.length;
    
    if (!document.getElementById('shop-view').classList.contains('hidden')) filterProducts();
    if (!document.getElementById('wishlist-view').classList.contains('hidden')) renderWishlist();
}

function renderWishlist() { renderProducts(products.filter(p => wishlist.includes(String(p.id))), 'wishlist-list'); }
function getCartTotal() { return cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0); }

function applyPromo() {
    const codeEl = document.getElementById('promo-input');
    const msgEl = document.getElementById('promo-msg');
    const code = codeEl.value.trim().toUpperCase();
    
    if (code === 'CUTE20') { 
        discountMultiplier = 0.8; 
        msgEl.innerText = "20% Off Applied!"; 
        msgEl.style.color = "var(--primary-color)"; 
        showToast("Promo code applied!", "success"); 
    } else { 
        discountMultiplier = 1; 
        msgEl.innerText = "Invalid code."; 
        msgEl.style.color = "var(--error-red)"; 
    }
    renderCart(); 
    document.getElementById('cart-total-nav').innerText = (getCartTotal() * discountMultiplier).toFixed(2);
}

function renderCart() {
    const tbody = document.getElementById('cart-items');
    tbody.innerHTML = cart.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 30px; font-weight:bold; color:var(--text-gray);">Your basket is empty. Add some crafts!</td></tr>' : '';
    cart.forEach(item => {
        tbody.innerHTML += `<tr>
            <td data-label="Craft" style="font-weight:bold;"><img src="${item.img}" style="width:45px; height:45px; border-radius:8px; vertical-align:middle; margin-right:10px; object-fit:cover;"> ${item.name}</td>
            <td data-label="Price">£${Number(item.price).toFixed(2)}</td>
            <td data-label="Quantity"><input type="number" value="${item.qty}" min="1" max="${item.stock}" style="width:65px; padding:8px; margin:0; border-radius:8px;" onchange="updateQty('${item.id}', this.value)"></td>
            <td data-label="Total" style="color:var(--primary-color); font-weight:bold;">£${(Number(item.price) * item.qty).toFixed(2)}</td>
            <td data-label="Action"><button onclick="removeItem('${item.id}')" style="color:var(--error-red); background:none; border:none; cursor:pointer; font-size:1.2rem; transition:0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"><i class="fas fa-trash-alt"></i></button></td>
        </tr>`;
    });
    
    document.getElementById('cart-subtotal').innerText = getCartTotal().toFixed(2);
    document.getElementById('cart-grand-total').innerText = (getCartTotal() * discountMultiplier).toFixed(2);
}

function updateQty(id, val) {
    const item = cart.find(i => String(i.id) === String(id)); 
    const p = products.find(x => String(x.id) === String(id));
    if(!item) return;
    
    let n = parseInt(val);
    const maxStock = p ? p.stock : item.stock;
    
    if (isNaN(n) || n < 1) n = 1; 
    else if (n > maxStock) { n = maxStock; showToast(`Only ${maxStock} available.`, "error"); }
    
    item.qty = n; 
    localStorage.setItem('kcCart', JSON.stringify(cart)); 
    renderCart(); 
    document.getElementById('cart-total-nav').innerText = (getCartTotal() * discountMultiplier).toFixed(2);
}

function removeItem(id) {
    cart = cart.filter(i => String(i.id) !== String(id)); 
    localStorage.setItem('kcCart', JSON.stringify(cart));
    renderCart(); 
    document.getElementById('cart-total-nav').innerText = (getCartTotal() * discountMultiplier).toFixed(2); 
}

// =========================================================
// 8. MULTI-STEP CHECKOUT & POST TO NODE BACKEND
// =========================================================
function goToCheckout() {
    if (cart.length === 0) return showToast("Your basket is empty!", "error");
    nextCheckoutStep(1); showView('checkout'); renderCheckout();
}

function nextCheckoutStep(step) {
    if (step === 2) {
        const name = document.getElementById('checkout-name').value;
        const address = document.getElementById('checkout-address').value;
        if (!name || !address) return showToast("Please fill in delivery details.", "error");
    }
    if (step === 3) {
        const cardNum = document.getElementById('card-num').value;
        if (!cardNum) return showToast("Please enter your payment details.", "error");
    }

    document.querySelectorAll('[id^="checkout-step-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`checkout-step-${step}`).classList.remove('hidden');
    document.getElementById(`step-${step}-tab`).classList.add('active');
    
    if(step === 3) {
        const addrInput = document.getElementById('checkout-address');
        const cNumInput = document.getElementById('card-num');
        document.getElementById('review-addr-disp').innerText = addrInput.value || 'N/A';
        document.getElementById('review-card-disp').innerText = cNumInput.value ? cNumInput.value.slice(-4) : '####';
    }
}

function updateCardUI() {
    const numInput = document.getElementById('card-num');
    const nameInput = document.getElementById('card-name');
    const expInput = document.getElementById('card-exp');
    const cvvInput = document.getElementById('card-cvv');
    
    document.getElementById('card-disp-num').innerText = numInput.value || '#### #### #### ####';
    document.getElementById('card-disp-name').innerText = nameInput.value.toUpperCase() || 'JOHN DOE';
    document.getElementById('card-disp-exp').innerText = expInput.value || 'MM/YY';
    document.getElementById('card-disp-cvv').innerText = cvvInput.value || '###';
}

function flipCard(flipped) {
    const card = document.getElementById('interactive-card');
    flipped ? card.classList.add('is-flipped') : card.classList.remove('is-flipped');
}

function renderCheckout() {
    const summary = document.getElementById('order-summary-list');
    summary.innerHTML = cart.map(i => `<div style="display:flex; justify-content:space-between; margin-bottom: 8px; color:var(--text-dark); padding-bottom:8px; border-bottom:1px solid var(--border-color);"><span><strong>${i.qty}x</strong> ${i.name}</span><span style="font-weight:bold; color:var(--primary-color);">£${(Number(i.price) * i.qty).toFixed(2)}</span></div>`).join('');
    if (discountMultiplier < 1) {
        summary.innerHTML += `<div style="display:flex; justify-content:space-between; color:var(--error-red); margin-top:10px; font-weight:bold;"><span>Promo Code</span><span>-20%</span></div>`;
    }
    document.getElementById('checkout-total-btn').innerText = (getCartTotal() * discountMultiplier).toFixed(2);
}

function placeOrder() {
    const nameEl = document.getElementById('checkout-name');
    const cNumEl = document.getElementById('card-num');
    if (!nameEl.value || !cNumEl.value) {
        return showToast("Please fill in shipping and payment details.", "error");
    }
    openModal('confirmation-modal');
}

function confirmOrder() {
    if (!currentUser) return showToast("You must be logged in to order.", "error");
    closeModal('confirmation-modal');
    
    const finalTotal = parseFloat((getCartTotal() * discountMultiplier).toFixed(2));
    const orderData = {
        userEmail: currentUser,
        items: cart, 
        total: finalTotal,
        status: "Processing"
    };

    // POST TO NODE API (server.js)
    fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if(!response.ok) throw new Error("API failed to save order");
        return response.json();
    })
    .then(data => {
        if (typeof confetti === "function") confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#FF7B54', '#FFB26B', '#ffffff'] }); 
        showToast("Order placed successfully! ID: " + (data.orderId ? data.orderId.substring(0,8) : "N/A"), "success");
        
        cart = []; 
        discountMultiplier = 1; 
        localStorage.removeItem('kcCart'); 
        document.getElementById('cart-total-nav').innerText = "0.00";
        
        ['name', 'email', 'phone', 'address'].forEach(id => { const el = document.getElementById('checkout-' + id); if(el) el.value = ''; });
        ['num', 'name', 'exp', 'cvv'].forEach(id => { const el = document.getElementById('card-' + id); if(el) el.value = ''; });
        
        showView('profile'); 
    })
    .catch(error => {
        console.error("Backend offline, saving locally.", error);
        showToast("Server offline. Order saved locally.", "error");
        
        orderData.id = Math.floor(Math.random() * 100000);
        orderData.date = new Date().toISOString();
        let localOrders = JSON.parse(localStorage.getItem('kcOrders')) || [];
        localOrders.push(orderData);
        localStorage.setItem('kcOrders', JSON.stringify(localOrders));
        
        cart = []; discountMultiplier = 1; localStorage.removeItem('kcCart'); 
        document.getElementById('cart-total-nav').innerText = "0.00";
        showView('profile'); 
    });
}

// =========================================================
// 9. FETCH FROM BACKEND: PROFILE ORDERS
// =========================================================
function renderProfile() {
    if(!currentUser) return;
    const list = document.getElementById('order-history-list'); 
    list.innerHTML = 'Fetching orders from server...';
    let spent = 0;

    fetch(`http://localhost:3000/api/orders/${currentUser}`)
    .then(response => {
        if(!response.ok) throw new Error("Failed to fetch orders");
        return response.json();
    })
    .then((orders) => {
        list.innerHTML = '';
        if(orders.length === 0) {
            list.innerHTML = '<p style="color:var(--text-gray);">No orders found. Time to adopt a tiny craft!</p>';
        } else {
            orders.forEach((o) => {
                spent += parseFloat(o.total);
                list.innerHTML += `<div style="background:var(--input-bg); padding:20px; border-radius:15px; margin-bottom:15px; color:var(--text-dark);"><div style="display:flex; justify-content:space-between; margin-bottom:5px;"><strong style="font-family:'Poppins', sans-serif;">Order ID: ${o.id ? o.id.substring(0,8) : 'Local'}</strong><span style="color:var(--primary-color); font-weight:bold; font-size:1.2rem;">£${Number(o.total).toFixed(2)}</span></div><p style="font-size:0.85rem; color:var(--text-gray); margin-bottom:10px; font-weight:bold;">${new Date(o.date || o.createdAt || Date.now()).toLocaleDateString()} - Status: ${o.status || 'Processing'}</p><div style="font-size:0.9rem; line-height:1.6;">${o.items.map(i=>`<b>${i.qty}x</b> ${i.name}`).join('<br> ')}</div></div>`;
            });
        }
        document.getElementById('profile-total-spent').innerText = spent.toFixed(2);
        document.getElementById('profile-order-count').innerText = orders.length;
    })
    .catch(error => {
        console.error("Error loading orders from backend:", error);
        list.innerHTML = '<p style="color:var(--error-red); margin-bottom:10px;">Backend Server offline. Showing local cache.</p>';
        let localOrders = JSON.parse(localStorage.getItem('kcOrders')) || [];
        localOrders = localOrders.filter(o => o.userEmail === currentUser);
        
        if(localOrders.length === 0) list.innerHTML += '<p style="color:var(--text-gray);">No local orders found.</p>';
        localOrders.reverse().forEach(o => {
            spent += parseFloat(o.total);
            list.innerHTML += `<div style="background:var(--input-bg); padding:20px; border-radius:15px; margin-bottom:15px; color:var(--text-dark);"><div style="display:flex; justify-content:space-between; margin-bottom:5px;"><strong style="font-family:'Poppins', sans-serif;">Order #${o.id}</strong><span style="color:var(--primary-color); font-weight:bold; font-size:1.2rem;">£${Number(o.total).toFixed(2)}</span></div><p style="font-size:0.85rem; color:var(--text-gray); margin-bottom:10px; font-weight:bold;">${new Date(o.date).toLocaleDateString()} - Status: ${o.status || 'Processing'}</p><div style="font-size:0.9rem; line-height:1.6;">${o.items.map(i=>`<b>${i.qty}x</b> ${i.name}`).join('<br> ')}</div></div>`;
        });
        document.getElementById('profile-total-spent').innerText = spent.toFixed(2);
        document.getElementById('profile-order-count').innerText = localOrders.length;
    });
}

// =========================================================
// 10. ADMIN DASHBOARD & SPRINT TRACKER
// =========================================================
function renderAdmin() {
    renderSprintTracker();

    document.getElementById('admin-products-count').innerText = products.length;
    document.getElementById('admin-inventory-list').innerHTML = products.map(p => `<tr>
        <td><img src="${p.img}" onerror="this.src='baby.jpg'" style="width:45px; height:45px; object-fit:cover; border-radius:8px;"></td>
        <td style="color:var(--text-dark); font-weight:bold;">${p.name}</td>
        <td style="color:var(--primary-color); font-weight:bold;">£${Number(p.price).toFixed(2)}</td>
        <td><input type="number" value="${p.stock}" onchange="adminUpdateStock('${p.id}', this.value)" style="width:70px; padding:8px; margin:0; border-radius:8px;"></td>
        <td><button onclick="adminDelete('${p.id}')" style="color:var(--error-red); background:none; border:none; cursor:pointer; font-size:1.3rem;"><i class="fas fa-trash-alt"></i></button></td>
    </tr>`).join('');
    
    fetch('http://localhost:3000/api/orders/all')
    .then(res => res.json())
    .then(orders => {
        if(Array.isArray(orders)) {
            let globalRev = 0;
            orders.forEach(o => globalRev += parseFloat(o.total));
            document.getElementById('admin-revenue').innerText = `£${globalRev.toFixed(2)}`;
            document.getElementById('admin-orders-count').innerText = orders.length;
        }
    }).catch(err => {
        document.getElementById('admin-revenue').innerText = "Backend Off";
        document.getElementById('admin-orders-count').innerText = "-";
    });
}

function adminUpdateStock(id, val) {
    const p = products.find(x => String(x.id) === String(id));
    if(p) { p.stock = parseInt(val) || 0; localStorage.setItem('kcProducts', JSON.stringify(products)); showToast("Stock updated! (Locally)", "success"); }
}

function adminDelete(id) {
    products = products.filter(x => String(x.id) !== String(id));
    localStorage.setItem('kcProducts', JSON.stringify(products));
    renderAdmin(); showToast("Product deleted. (Locally)", "success");
}

// =========================================================
// 10. ADMIN - IMAGE FILE PREVIEW
// =========================================================
function previewImageFile() {
    const fileInput = document.getElementById('add-img-file');
    const previewDiv = document.getElementById('img-preview');
    const previewImg = document.getElementById('preview-img');
    const filenameText = document.getElementById('img-filename');
    const hiddenInput = document.getElementById('add-img');
    
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const filename = file.name;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewDiv.style.display = 'block';
        };
        reader.readAsDataURL(file);
        
        // Set filename in hidden input
        filenameText.textContent = 'File: ' + filename;
        hiddenInput.value = 'images/' + filename; // Store with images/ prefix
        
        showToast('Image selected! After saving, add the file to the images/ folder', 'info');
    }
}

function adminAddProduct() {
    const name = document.getElementById('add-name').value;
    const cat = document.getElementById('add-cat').value;
    const price = document.getElementById('add-price').value;
    const stock = document.getElementById('add-stock').value || 10;
    const img = document.getElementById('add-img').value || 'images/baby.jpg';
    const desc = document.getElementById('add-desc').value || "A new cute craft addition.";
    
    if(!name || !price) return showToast("Name and Price are required", "error");
    
    const newProd = { id: Date.now(), name, cat, price: parseFloat(price), stock: parseInt(stock), img, desc, reviews: [] };
    products.push(newProd); 
    localStorage.setItem('kcProducts', JSON.stringify(products));
    
    ['name','cat','price','stock','img','desc'].forEach(id => { const el = document.getElementById('add-'+id); if(el) el.value = ''; });
    document.getElementById('add-img-file').value = '';
    document.getElementById('img-preview').style.display = 'none';
    renderAdmin(); 
    showToast("Product added! (Locally)", "success");
}

// =========================================================
// 11. BACK BUTTON FIX (HASH ROUTING)
// =========================================================
window.addEventListener('popstate', () => {
    let hash = window.location.hash.substring(1);
    if (!hash) hash = 'landing';
    showView(hash, false); 
});

document.addEventListener("DOMContentLoaded", () => { 
    let initialView = window.location.hash.substring(1) || 'landing';
    showView(initialView, false); 
});