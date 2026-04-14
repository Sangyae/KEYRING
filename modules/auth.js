function registerUser(event) {
    event.preventDefault(); 
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    
    auth.createUserWithEmailAndPassword(email, pass)
        .then((result) => {
            const user = result.user;
            
            // NEW FIX: Create their profile in the database!
            db.collection("users").doc(user.uid).set({
                email: user.email,
                userType: 'Customer', // Normal email signups are always customers
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                showToast("Account created successfully!", "success");
                toggleMobileAuth(event, false); 
            })
            .catch(dbError => {
                console.error("Auth succeeded but DB save failed:", dbError);
                showToast("Account created successfully!", "success");
                toggleMobileAuth(event, false); 
            });
        })
        .catch((error) => { showToast(error.message, "error"); });
}

function loginUser(event) {
    event.preventDefault(); 
    const email = document.getElementById('login-user').value.trim(); 
    const pass = document.getElementById('login-pass').value.trim();
    
    auth.signInWithEmailAndPassword(email, pass)
        .then((result) => {
            const user = result.user;
            
            // THE FIX: "Just-In-Time Migration" for old existing users!
            // { merge: true } ensures we don't accidentally overwrite data if they already exist
            db.collection("users").doc(user.uid).set({
                email: user.email,
                userType: user.email === 'admin@tinycrafts.com' ? 'Admin' : 'Customer',
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }) 
            .then(() => {
                showToast(`Welcome back, ${user.email.split('@')[0]}!`, "success");
                showView('shop');
            })
            .catch(dbError => {
                console.warn("DB update failed but login continues.", dbError);
                showToast(`Welcome back, ${user.email.split('@')[0]}!`, "success");
                showView('shop');
            });
        })
        .catch((error) => { showToast(error.message, "error"); });
}

// GOOGLE LOGIN FIX
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        const user = result.user;
        const safeEmail = user.email || "No Email Provided";
        
        db.collection("users").doc(user.uid).set({
            email: safeEmail,
            userType: safeEmail === 'admin@tinycrafts.com' ? 'Admin' : 'Customer',
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }) 
        .then(() => {
            showToast("Logged in with Google!", "success");
            showView('shop');
        })
        .catch(dbError => {
            console.warn("DB rules blocked user save, but login continues.", dbError);
            showToast("Logged in safely!", "success");
            showView('shop');
        });

    }).catch(error => {
        console.error(error);
        showToast("Google Sign-In Failed.", "error");
    });
}

// GITHUB LOGIN FIX
function signInWithGitHub() {
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        const user = result.user;
        const safeEmail = user.email || "No Email Provided";
        
        db.collection("users").doc(user.uid).set({
            email: safeEmail,
            userType: safeEmail === 'admin@tinycrafts.com' ? 'Admin' : 'Customer',
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }) 
        .then(() => {
            showToast("Logged in with GitHub!", "success");
            showView('shop');
        })
        .catch(dbError => {
            console.warn("DB rules blocked user save, but login continues.", dbError);
            showToast("Logged in safely!", "success");
            showView('shop');
        });

    }).catch(error => {
        console.error(error);
        showToast("GitHub Sign-In Failed.", "error");
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
        
        localStorage.removeItem('kcCart');
        localStorage.removeItem('kcWishlist');
        
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
        currentUser = user.email || user.uid; 
        
        //Check if they are a subscriber!
        if (user.email) {
            db.collection("subscribers").doc(user.email.toLowerCase()).get()
            .then(doc => {
                isSubscriber = doc.exists;
                if(typeof applyPromo === 'function') applyPromo(); // Refresh cart prices
            });
        }
        const fallbackName = user.email ? user.email.split('@')[0] : "Crafter";
        const displayName = user.displayName || fallbackName;
        
        document.getElementById('profile-name-nav').innerText = displayName;
        document.getElementById('profile-name-display-card').innerText = displayName;
        
        // NEW FIX: Update the button on the landing page!
        const landingBtn = document.getElementById('landing-auth-btn');
        if(landingBtn) {
            landingBtn.innerHTML = `<i class="fas fa-user"></i> ${displayName}`;
            landingBtn.onclick = () => showView('profile');
        }
        
        const adminBtn = document.getElementById('admin-nav-btn');
        if (user.email === "admin@tinycrafts.com") {
            adminBtn.classList.remove('hidden');
            adminBtn.style.display = 'flex';
        } else {
            adminBtn.classList.add('hidden');
            adminBtn.style.display = 'none';
        }

        const currentHash = window.location.hash.substring(1);
        if (currentHash === 'profile') renderProfile();
        if (currentHash === 'cart') renderCart();

    } else {
        currentUser = null;
        document.getElementById('profile-name-nav').innerText = "Sign In";
        const adminBtn = document.getElementById('admin-nav-btn');
        if(adminBtn) adminBtn.classList.add('hidden');
        
        // NEW FIX: Reset the landing page button if they log out
        const landingBtn = document.getElementById('landing-auth-btn');
        if(landingBtn) {
            landingBtn.innerText = "Sign In";
            landingBtn.onclick = () => showView('login');
        }
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