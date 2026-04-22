// --- ADMIN: ADD NEW PRODUCT (WITH COMPRESSION) --- //
function addNewProduct(event) {
    event.preventDefault();
    const fileInput = document.getElementById('new-prod-img-file');
    const file = fileInput.files[0];

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

    // Use the compressor!
    if (file) {
        compressImage(file, function(compressedData) {
            saveToFirebase(compressedData); // FIXED: Calling the right save function
        });
    } else {
        saveToFirebase('images/baby.jpg');
    }
}

// --- ADMIN: OPEN EDIT MODAL --- //
function openEditModal(id) {
    const p = products.find(x => String(x.id) === String(id));
    if(!p) return;

    document.getElementById('edit-prod-id').value = id;
    document.getElementById('edit-prod-name').value = p.name;
    document.getElementById('edit-prod-price').value = p.price;
    document.getElementById('edit-prod-cat').value = p.category || 'Animals & Wildlife';
    document.getElementById('edit-prod-stock').value = p.stock;
    document.getElementById('edit-prod-desc').value = p.description || '';
    document.getElementById('edit-prod-img-file').value = ''; // Reset file input

    openModal('edit-product-modal');
}

// --- ADMIN: SAVE EDITED PRODUCT (WITH COMPRESSION) --- //
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
        
        if (imgData) updatedData.img = imgData;

        db.collection("products").doc(id).update(updatedData).then(() => {
            showToast("Craft updated successfully!", "success");
            closeModal('edit-product-modal');
            renderInventory(); 
        }).catch(err => showToast("Error updating product", "error"));
    };

    // Use the compressor!
    if (file) {
        compressImage(file, function(compressedData) {
            updateInFirebase(compressedData); // FIXED: Using the compressor here too!
        });
    } else {
        updateInFirebase(null);
    }
}

// --- HELPER: COMPRESS IMAGE BEFORE SAVING --- //
// FIXED: Moved outside to the bottom so everyone can use it!
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            const MAX_SIZE = 800;
            if (width > height && width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            callback(compressedBase64);
        }
    }
}