// 3. ADD NEW PRODUCT TO FIREBASE (Without Cloud Storage)
function adminAddProduct() {
    const name = document.getElementById('add-name').value;
    const cat = document.getElementById('add-cat').value;
    const price = document.getElementById('add-price').value;
    const stock = document.getElementById('add-stock').value || 10;
    const desc = document.getElementById('add-desc').value || "A new cute craft addition.";
    
    // Grab the hidden input value we created during previewImageFile()
    const imgValue = document.getElementById('add-img').value || 'images/baby.jpg';
    
    if(!name || !price) return showToast("Name and Price are required", "error");
    
    const newId = Date.now().toString(); 
    const newProd = { id: parseInt(newId), name, cat, price: parseFloat(price), stock: parseInt(stock), img: imgValue, desc, reviews: [] };
    
    db.collection("products").doc(newId).set(newProd)
    .then(() => {
        products.push(newProd); 
        
        // Clear forms
        ['name','cat','price','stock','desc', 'img'].forEach(id => { const el = document.getElementById('add-'+id); if(el) el.value = ''; });
        document.getElementById('add-img-file').value = '';
        document.getElementById('img-preview').style.display = 'none';
        
        renderAdmin(); 
        showToast("Product added to Cloud!", "success");
    })
    .catch(err => {
        console.error(err);
        showToast("Error adding product", "error");
    });


    // If an image was selected, upload it to Firebase Storage first
    if (fileInput.files && fileInput.files[0]) {
        showToast("Uploading image...", "success");
        const file = fileInput.files[0];
        const storageRef = storage.ref('product_images/' + newId + '_' + file.name);
        
        storageRef.put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(downloadURL => saveToDatabase(downloadURL)) // Get the live web link for the image
        .catch(err => { console.error(err); showToast("Image upload failed", "error"); });
    } else {
        // Fallback if no image was selected
        saveToDatabase("images/baby.jpg");
    }
}