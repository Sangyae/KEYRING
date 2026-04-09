// =========================================================
// AUTHENTICATION MODULE
// Sign in, Register, Logout, Social Auth
// =========================================================

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

// Listen for auth state changes
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

// Setup auth UI toggles
const authContainer = document.getElementById('auth-container');
document.getElementById('signUpBtn')?.addEventListener('click', () => { if(authContainer) authContainer.classList.add("right-panel-active"); });
document.getElementById('signInBtn')?.addEventListener('click', () => { if(authContainer) authContainer.classList.remove("right-panel-active"); });

function toggleMobileAuth(event, isSignUp) { 
    if(event) event.preventDefault(); 
    if(authContainer) {
        isSignUp ? authContainer.classList.add("right-panel-active") : authContainer.classList.remove("right-panel-active"); 
    }
}
