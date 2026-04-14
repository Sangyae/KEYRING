
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

    // FETCH PRODUCTS FROM FIRESTORE
    
db.collection("products").get()
    .then((querySnapshot) => {
        let cloudProducts = [];
        querySnapshot.forEach((doc) => {
            // We use parseInt to ensure the ID stays a number for your cart logic
            cloudProducts.push({ id: parseInt(doc.id), ...doc.data() });
        });
        
        products = cloudProducts; 

        // Apply your existing filters
        let filtered = products.filter(p => 
            (cat === 'all' || p.cat === cat) && 
            p.name.toLowerCase().includes(search) &&
            p.price <= maxPrice
        );
        
        if (sort === 'low') filtered.sort((a,b) => a.price - b.price);
        if (sort === 'high') filtered.sort((a,b) => b.price - a.price);
        
        renderProducts(filtered);
    })
    .catch(error => {
        console.error("Firestore error:", error);
        // Fallback to local defaultProducts if offline
        renderProducts(defaultProducts); 
    });

}

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
