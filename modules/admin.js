// =========================================================
// ADMIN MODULE
// Admin dashboard, Sprint tracker, Inventory management
// =========================================================
function renderAdmin() {
    // 1. Fetch live orders to update Revenue, Count, AND the Order Table
    db.collection("orders").get()
    .then(querySnapshot => {
        let globalRev = 0;
        let orderCount = 0;
        let ordersHTML = '';

        querySnapshot.forEach(doc => {
            const o = doc.data();
            globalRev += parseFloat(o.total) || 0;
            orderCount++;
            
            const currentStatus = o.status || 'Processing';

            // Build the row for each order with a status dropdown
            ordersHTML += `
            <tr>
                <td style="font-size:0.85rem; color:var(--text-gray);">#${doc.id.substring(0,8)}</td>
                <td style="font-size:0.85rem; font-weight:bold;">${o.userEmail}</td>
                <td style="color:var(--primary-color); font-weight:bold;">£${Number(o.total).toFixed(2)}</td>
                <td>
                    <select onchange="adminUpdateOrderStatus('${doc.id}', this.value)" style="width: 130px; padding:6px; margin:0; border-radius:8px; font-size:0.85rem; background: var(--input-bg);">
                        <option value="Processing" ${currentStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${currentStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${currentStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${currentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>`;
        });
        
        document.getElementById('admin-revenue').innerText = `£${globalRev.toFixed(2)}`;
        document.getElementById('admin-orders-count').innerText = orderCount;
        
        // Inject the rows into the new table!
        const ordersListEl = document.getElementById('admin-orders-list');
        if (ordersListEl) ordersListEl.innerHTML = ordersHTML || '<tr><td colspan="4" style="text-align:center;">No orders yet.</td></tr>';

    }).catch(err => {
        console.error("Admin order fetch error:", err);
        document.getElementById('admin-revenue').innerText = "Error";
    });

}
// 1. UPDATE STOCK IN FIREBASE
function adminUpdateStock(id, val) {
    const p = products.find(x => String(x.id) === String(id));
    if(p) { 
        const newStock = parseInt(val) || 0; 
        
        // Update the cloud document
        db.collection("products").doc(String(id)).update({ stock: newStock })
        .then(() => {
            p.stock = newStock; // Update local array
            showToast("Stock updated in Cloud!", "success"); 
        })
        .catch(err => {
            console.error(err);
            showToast("Error updating stock in cloud", "error");
        });
    }
}

// 2. DELETE PRODUCT FROM FIREBASE
function adminDelete(id) {
    // Delete the document from the cloud
    db.collection("products").doc(String(id)).delete()
    .then(() => {
        products = products.filter(x => String(x.id) !== String(id)); // Remove from local array
        renderInventory(); // Refresh UI
        showToast("Product deleted from Cloud!", "success");
    })
    .catch(err => {
        console.error(err);
        showToast("Error deleting product", "error");
    });
}

// 3. ADD NEW PRODUCT TO FIREBASE
function adminAddProduct() {
    const name = document.getElementById('add-name').value;
    const cat = document.getElementById('add-cat').value;
    const price = document.getElementById('add-price').value;
    const stock = document.getElementById('add-stock').value || 10;
    const img = document.getElementById('add-img').value || 'images/baby.jpg';
    const desc = document.getElementById('add-desc').value || "A new cute craft addition.";
    
    if(!name || !price) return showToast("Name and Price are required", "error");
    
    const newId = Date.now().toString(); // Generate a unique ID based on the exact time
    const newProd = { id: parseInt(newId), name, cat, price: parseFloat(price), stock: parseInt(stock), img, desc, reviews: [] };
    
    // Save the new product to the cloud
    db.collection("products").doc(newId).set(newProd)
    .then(() => {
        products.push(newProd); // Update local array so it shows up instantly
        
        // Clear the input forms
        ['name','cat','price','stock','img','desc'].forEach(id => { const el = document.getElementById('add-'+id); if(el) el.value = ''; });
        document.getElementById('add-img-file').value = '';
        document.getElementById('img-preview').style.display = 'none';
        
        renderAdmin(); 
        showToast("Product added to Cloud!", "success");
    })
    .catch(err => {
        console.error(err);
        showToast("Error adding product to cloud", "error");
    });
}

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
    }
}
// 4. UPDATE ORDER STATUS IN FIREBASE
function adminUpdateOrderStatus(orderId, newStatus) {
    db.collection("orders").doc(orderId).update({ status: newStatus })
    .then(() => {
        showToast(`Order marked as ${newStatus}!`, "success");
    })
    .catch(err => {
        console.error(err);
        showToast("Error updating order status", "error");
    });
}

// 5. RENDER DEDICATED INVENTORY PAGE
function renderInventory() {
    db.collection("products").get()
    .then(querySnapshot => {
        let cloudProducts = [];
        querySnapshot.forEach(doc => {
            cloudProducts.push({ id: parseInt(doc.id) || doc.id, ...doc.data() });
        });
        cloudProducts.sort((a,b) => parseInt(a.id) - parseInt(b.id));
        products = cloudProducts; 

        const listEl = document.getElementById('admin-inventory-list');
        if (listEl) {
            listEl.innerHTML = products.map(p => {
                let safeImg = p.img;
                if (!safeImg.startsWith('images/') && !safeImg.startsWith('http')) safeImg = 'images/' + safeImg;
                
                return `<tr>
                    <td><img src="${safeImg}" onerror="this.src='images/baby.jpg'" style="width:45px; height:45px; object-fit:cover; border-radius:8px;"></td>
                    <td style="color:var(--text-dark); font-weight:bold;">${p.name}</td>
                    <td style="color:var(--primary-color); font-weight:bold;">£${Number(p.price).toFixed(2)}</td>
                    <td><input type="number" value="${p.stock}" onchange="adminUpdateStock('${p.id}', this.value)" style="width:70px; padding:8px; margin:0; border-radius:8px;"></td>
                    <td><button onclick="adminDelete('${p.id}')" style="color:var(--error-red); background:none; border:none; cursor:pointer; font-size:1.3rem;"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;
            }).join('');
        }
    }).catch(err => console.error("Inventory fetch error:", err));
}