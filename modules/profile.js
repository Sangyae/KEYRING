// =========================================================
// PROFILE & PAYMENT MODULE
// User profile, Order history, Payment details
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
