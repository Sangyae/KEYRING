// Admin dashboard, Sprint tracker, Inventory management
// =========================================================

function renderAdmin() {
    document.getElementById('admin-products-count').innerText = products.length;
    
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

           ordersHTML += `
            <tr>
                <td data-label="Order ID" style="font-size:0.85rem; color:var(--text-gray);">#${doc.id.substring(0,8)}</td>
                <td data-label="Customer" style="font-size:0.85rem; font-weight:bold;">${o.userEmail}</td>
                <td data-label="Total" style="color:var(--primary-color); font-weight:bold;">£${Number(o.total).toFixed(2)}</td>
                <td data-label="Status">
                    <select onchange="adminUpdateOrderStatus('${doc.id}', this.value)" style="width: 130px; padding:6px; margin:0; border-radius:8px; font-size:0.85rem; background: var(--input-bg);">
                        <option value="Processing" ${currentStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${currentStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${currentStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${currentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td data-label="Action">
                    <button onclick="adminDeleteOrder('${doc.id}')" style="color:var(--error-red); background:none; border:none; cursor:pointer; font-size:1.3rem; transition:0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
        });
        
        document.getElementById('admin-revenue').innerText = `£${globalRev.toFixed(2)}`;
        document.getElementById('admin-orders-count').innerText = orderCount;
        
        const ordersListEl = document.getElementById('admin-orders-list');
        if (ordersListEl) ordersListEl.innerHTML = ordersHTML || '<tr><td colspan="4" style="text-align:center;">No orders yet.</td></tr>';

    }).catch(err => {
        console.error("Admin order fetch error:", err);
        document.getElementById('admin-revenue').innerText = "Error";
    });
}

function adminUpdateStock(id, val) {
    const p = products.find(x => String(x.id) === String(id));
    if(p) { 
        const newStock = parseInt(val) || 0; 
        db.collection("products").doc(String(id)).update({ stock: newStock })
        .then(() => {
            p.stock = newStock;
            showToast("Stock updated in Cloud!", "success"); 
        })
        .catch(err => {
            console.error(err);
            showToast("Error updating stock in cloud", "error");
        });
    }
}

function adminDelete(id) {
    db.collection("products").doc(String(id)).delete()
    .then(() => {
        products = products.filter(x => String(x.id) !== String(id)); 
        renderInventory(); 
        showToast("Product deleted from Cloud!", "success");
    })
    .catch(err => {
        console.error(err);
        showToast("Error deleting product", "error");
    });
}

function adminAddProduct() {
    const name = document.getElementById('add-name').value;
    const cat = document.getElementById('add-cat').value;
    const price = document.getElementById('add-price').value;
    const stock = document.getElementById('add-stock').value || 10;
    const img = document.getElementById('add-img').value || 'images/baby.jpg';
    const desc = document.getElementById('add-desc').value || "A new cute craft addition.";
    
    if(!name || !price) return showToast("Name and Price are required", "error");
    
    const newId = Date.now().toString(); 
    const newProd = { id: parseInt(newId), name, cat, price: parseFloat(price), stock: parseInt(stock), img, desc, reviews: [] };
    
    db.collection("products").doc(newId).set(newProd)
    .then(() => {
        products.push(newProd); 
        ['name','cat','price','stock','img','desc'].forEach(id => { const el = document.getElementById('add-'+id); if(el) el.value = ''; });
        document.getElementById('add-img-file').value = '';
        document.getElementById('img-preview').style.display = 'none';
        renderInventory(); 
        showToast("Product added to Cloud!", "success");
    })
    .catch(err => {
        console.error(err);
        showToast("Error adding product", "error");
    });
}

// --- ADMIN: UPDATE ORDER STATUS --- //
function adminUpdateOrderStatus(orderId, newStatus) {
    db.collection("orders").doc(orderId).update({
        status: newStatus
    })
    .then(() => {
        showToast(`Order status updated to ${newStatus}!`, "success");
    })
    .catch(err => {
        console.error("Error updating status:", err);
        showToast("Failed to update status.", "error");
    });
}
// --- ADMIN: DELETE ORDER (UI TRIGGER) --- //
function adminDeleteOrder(orderId) {
    // 1. Open our beautiful custom modal
    openModal('admin-delete-modal');
    
    // 2. Find the "Yes, Delete" button inside that modal
    const confirmBtn = document.getElementById('confirm-delete-btn');
    
    // 3. Tell that button EXACTLY which order to delete if they click it!
    confirmBtn.onclick = function() {
        executeDeleteOrder(orderId);
    };
}

// --- ADMIN: EXECUTE ACTUAL DELETION --- //
function executeDeleteOrder(orderId) {
    // Instantly hide the modal
    closeModal('admin-delete-modal'); 
    
    // Delete from Firebase
    db.collection("orders").doc(orderId).delete()
    .then(() => {
        showToast("Order permanently deleted!", "success");
        renderAdmin(); // Refresh the dashboard instantly to remove the row
    })
    .catch(err => {
        console.error(err);
        showToast("Error deleting order", "error");
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
        
        // Save the full list to memory
        products = cloudProducts; 

        // Draw the full table initially
        drawInventoryTable(products);
    }).catch(err => console.error("Inventory fetch error:", err));
}

// Helper Function: Draws the HTML table based on an array
function drawInventoryTable(itemsToDraw) {
    const listEl = document.getElementById('inventory-page-list');
    if (!listEl) return;
    
    // 1. THE EMPTY STATE (Fixed: Removed the broken buttons from here)
    if (itemsToDraw.length === 0) {
        listEl.innerHTML = `<tr>
            <td colspan="5" style="text-align:center; color:var(--text-gray); padding: 20px;">No items found matching your search.</td>
        </tr>`;
        return;
    }

    // 2. THE ACTUAL ROWS (Fixed: Added the Edit button next to the Delete button)
    listEl.innerHTML = itemsToDraw.map(p => {
        let safeImg = p.img || 'images/baby.jpg';
        if (!safeImg.startsWith('images/') && !safeImg.startsWith('http') && !safeImg.startsWith('data:image')) safeImg = 'images/' + safeImg;
        
        return `<tr>
            <td data-label="Image"><img src="${safeImg}" onerror="this.src='images/baby.jpg'" style="width:45px; height:45px; object-fit:cover; border-radius:8px;"></td>
            <td data-label="Name" style="color:var(--text-dark); font-weight:bold;">${p.name}</td>
            <td data-label="Price" style="color:var(--primary-color); font-weight:bold;">£${Number(p.price).toFixed(2)}</td>
            <td data-label="Stock"><input type="number" value="${p.stock}" onchange="adminUpdateStock('${p.id}', this.value)" style="width:70px; padding:8px; margin:0; border-radius:8px;"></td>
            
            <td data-label="Action">
                <button onclick="openEditModal('${p.id}')" style="color:var(--primary-color); background:none; border:none; cursor:pointer; font-size:1.3rem; margin-right: 15px;" title="Edit"><i class="fas fa-edit"></i></button>
                
                <button onclick="adminDelete('${p.id}')" style="color:var(--error-red); background:none; border:none; cursor:pointer; font-size:1.3rem;" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// NEW: Instant Search Filter
function filterInventory() {
    const searchTerm = document.getElementById('inventory-search').value.toLowerCase().trim();
    
    // Look through the memory for matching names
    const filteredItems = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    
    // Instantly redraw the table with only the matches!
    drawInventoryTable(filteredItems);
}

// --- ADMIN: ADD NEW PRODUCT (WITH LOCAL FILE UPLOAD) --- //
function addNewProduct(event) {
    event.preventDefault();
    const fileInput = document.getElementById('new-prod-img-file');
    const file = fileInput.files[0];

    // Helper function to save after image is processed
    const saveToFirebase = (imgData) => {
        const newProduct = {
            name: document.getElementById('new-prod-name').value,
            price: parseFloat(document.getElementById('new-prod-price').value),
            category: document.getElementById('new-prod-cat').value,
            stock: parseInt(document.getElementById('new-prod-stock').value),
            img: imgData,
            description: document.getElementById('new-prod-desc').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection("products").add(newProduct).then(() => {
            showToast("New craft added!", "success");
            closeModal('add-product-modal');
            event.target.reset(); // Clear form
            if(typeof renderInventory === 'function') renderInventory();
        }).catch(err => showToast("Failed to add product.", "error"));
    };

    // Read the file from the computer and convert to a text string
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => saveToFirebase(e.target.result);
        reader.readAsDataURL(file);
    } else {
        saveToFirebase('images/baby.jpg'); // Fallback if no file
    }
}

// --- ADMIN: OPEN EDIT MODAL --- //
function openEditModal(id) {
    const p = products.find(x => String(x.id) === String(id));
    if(!p) return;

    // Fill the form with the current product's details
    document.getElementById('edit-prod-id').value = id;
    document.getElementById('edit-prod-name').value = p.name;
    document.getElementById('edit-prod-price').value = p.price;
    document.getElementById('edit-prod-cat').value = p.category || 'Animals & Wildlife';
    document.getElementById('edit-prod-stock').value = p.stock;
    document.getElementById('edit-prod-desc').value = p.description || '';
    document.getElementById('edit-prod-img-file').value = ''; // Reset file input

    openModal('edit-product-modal');
}

// --- ADMIN: SAVE EDITED PRODUCT --- //
function saveEditedProduct(event) {
    event.preventDefault();
    const id = document.getElementById('edit-prod-id').value;
    const fileInput = document.getElementById('edit-prod-img-file');
    const file = fileInput.files[0];

    const updateInFirebase = (imgData) => {
        const updatedData = {
            name: document.getElementById('edit-prod-name').value,
            price: parseFloat(document.getElementById('edit-prod-price').value),
            category: document.getElementById('edit-prod-cat').value,
            stock: parseInt(document.getElementById('edit-prod-stock').value),
            description: document.getElementById('edit-prod-desc').value,
        };
        
        // Only update the image if the admin actually picked a new one
        if (imgData) updatedData.img = imgData;

        db.collection("products").doc(id).update(updatedData).then(() => {
            showToast("Craft updated successfully!", "success");
            closeModal('edit-product-modal');
            renderInventory(); // Refresh the table
        }).catch(err => showToast("Error updating product", "error"));
    };

    // Process new image if uploaded, otherwise save without touching the image
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => updateInFirebase(e.target.result);
        reader.readAsDataURL(file);
    } else {
        updateInFirebase(null);
    }
}