// =========================================================
// ADMIN MODULE
// Admin dashboard, Sprint tracker, Inventory management
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
    
  
    db.collection("orders").get()
    .then(querySnapshot => {
        let globalRev = 0;
        let orderCount = 0;
        querySnapshot.forEach(doc => {
            globalRev += parseFloat(doc.data().total);
            orderCount++;
        });
        document.getElementById('admin-revenue').innerText = `£${globalRev.toFixed(2)}`;
        document.getElementById('admin-orders-count').innerText = orderCount;
    }).catch(err => {
        console.error("Admin order fetch error:", err);
        document.getElementById('admin-revenue').innerText = "Error";
        document.getElementById('admin-orders-count').innerText = "-";
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
        renderAdmin(); // Refresh UI
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
