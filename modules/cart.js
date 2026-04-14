// =========================================================
// CART MODULE
// Cart management, Add/Remove items, Checkout
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

function getCartTotal() { 
    return cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0); 
}

function applyPromo() {
    const codeEl = document.getElementById('promo-input');
    const msgEl = document.getElementById('promo-msg');
    const code = codeEl ? codeEl.value.trim().toUpperCase() : '';

    if (code === 'CUTE20') { 
        if (isSubscriber) {
            // Subscriber + Code = 30% Off!
            discountMultiplier = 0.7; 
            if(msgEl) {
                msgEl.innerText = "30% Off Applied! (Subscriber Bonus Included)"; 
                msgEl.style.color = "var(--primary-color)"; 
            }
        } else {
            // Normal User + Code = 20% Off
            discountMultiplier = 0.8; 
            if(msgEl) {
                msgEl.innerText = "20% Off Applied!"; 
                msgEl.style.color = "var(--primary-color)"; 
            }
        }
        showToast("Promo code applied!", "success"); 
    } else { 
        // Invalid code or empty box
        if (code && msgEl) {
            msgEl.innerText = "Invalid code."; 
            msgEl.style.color = "var(--error-red)"; 
            discountMultiplier = isSubscriber ? 0.9 : 1.0;
        } else {
            // No code typed, just check if they get the automatic 10%
            discountMultiplier = isSubscriber ? 0.9 : 1.0;
            if (msgEl) {
                msgEl.innerText = isSubscriber ? "10% Subscriber Discount Active!" : "";
                msgEl.style.color = isSubscriber ? "var(--primary-color)" : "inherit";
            }
        }
    }
    
    renderCart(); 
    const totalNav = document.getElementById('cart-total-nav');
    if (totalNav) totalNav.innerText = (getCartTotal() * discountMultiplier).toFixed(2);
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
    
    //Dynamically calculate the discount percentage so it matches the cart!
    if (discountMultiplier < 1) {
        const percentOff = Math.round((1 - discountMultiplier) * 100);
        summary.innerHTML += `<div style="display:flex; justify-content:space-between; color:var(--error-red); margin-top:10px; font-weight:bold;"><span>Discount</span><span>-${percentOff}%</span></div>`;
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

    // POST TO NODE API - FALLBACK TO FIREBASE IF OFFLINE
    
    db.collection("orders").add(orderData)
        .then((docRef) => {
            if (typeof confetti === "function") confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#FF7B54', '#FFB26B', '#ffffff'] }); 
            showToast("Order placed successfully! ID: " + docRef.id.substring(0,8), "success");
            
            cart = []; 
            discountMultiplier = 1; 
            localStorage.removeItem('kcCart'); 
            document.getElementById('cart-total-nav').innerText = "0.00";
            
            ['name', 'email', 'phone', 'address'].forEach(id => { const el = document.getElementById('checkout-' + id); if(el) el.value = ''; });
            ['num', 'name', 'exp', 'cvv'].forEach(id => { const el = document.getElementById('card-' + id); if(el) el.value = ''; });
            
            showView('profile'); 
        })
        .catch(error => {
            console.error("Error saving order to cloud:", error);
            showToast("Error processing order. Please try again.", "error");
        });
}
