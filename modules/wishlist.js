// =========================================================
// WISHLIST MODULE
// Wishlist functionality
// =========================================================

function toggleWishlist(id, event) {
    event.stopPropagation();
    if(!currentUser) return showToast("Please Sign In first.", "error");
    
    const idx = wishlist.indexOf(String(id));
    if (idx > -1) { 
        wishlist.splice(idx, 1); 
        showToast("Removed from wishlist."); 
    } 
    else { 
        wishlist.push(String(id)); 
        showToast("Added to wishlist!", "success"); 
    }
    
    localStorage.setItem('kcWishlist', JSON.stringify(wishlist));
    document.getElementById('wish-count').innerText = wishlist.length;
    
    if (!document.getElementById('shop-view').classList.contains('hidden')) filterProducts();
    if (!document.getElementById('wishlist-view').classList.contains('hidden')) renderWishlist();
}

function renderWishlist() { 
    renderProducts(products.filter(p => wishlist.includes(String(p.id))), 'wishlist-list'); 
}
