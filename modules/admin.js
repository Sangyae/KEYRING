// =========================================================
// ADMIN MODULE
// Admin dashboard, Sprint tracker, Inventory management
// =========================================================

const projectTasks = [
    { id: 1, name: "1.1 UI/UX Design & Wireframing", sprint: "Sprint 1", float: 2, status: "Done" },
    { id: 2, name: "1.2 HTML/CSS Frontend UI", sprint: "Sprint 1", float: 0, status: "Done" },
    { id: 3, name: "2.1 Firebase Auth Integration", sprint: "Sprint 2", float: 0, status: "Done" },
    { id: 4, name: "2.2 Node.js Backend Routing", sprint: "Sprint 2", float: 0, status: "In Progress" },
    { id: 5, name: "3.1 Populate 20 Store Products", sprint: "Sprint 3", float: 5, status: "To Do" },
    { id: 6, name: "3.2 Testing & Critical Path Review", sprint: "Sprint 3", float: 0, status: "To Do" },
    { id: 7, name: "3.3 Final Report Documentation", sprint: "Sprint 3", float: 2, status: "To Do" }
];

function renderSprintTracker() {
    const tbody = document.getElementById('sprint-tracker-list');
    if(!tbody) return;
    tbody.innerHTML = projectTasks.map(t => {
        const isCritical = t.float === 0;
        const criticalBadge = isCritical ? `<span style="background:var(--error-red); color:white; padding:4px 8px; border-radius:12px; font-size:0.75rem; font-weight:bold;">YES (Zero Float)</span>` : `<span style="color:var(--text-gray); font-weight:bold;">No</span>`;
        
        let statusColor = "var(--text-gray)";
        if(t.status === "Done") statusColor = "var(--primary-color)";
        if(t.status === "In Progress") statusColor = "#fca311";

        return `<tr>
            <td style="font-weight:bold; color:var(--text-dark);">${t.name}</td>
            <td>${t.sprint}</td>
            <td>${t.float} Days</td>
            <td style="color:${statusColor}; font-weight:bold;">${t.status}</td>
            <td>${criticalBadge}</td>
        </tr>`;
    }).join('');
}

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
    
    fetch('http://localhost:3000/api/orders/all')
    .then(res => res.json())
    .then(orders => {
        if(Array.isArray(orders)) {
            let globalRev = 0;
            orders.forEach(o => globalRev += parseFloat(o.total));
            document.getElementById('admin-revenue').innerText = `£${globalRev.toFixed(2)}`;
            document.getElementById('admin-orders-count').innerText = orders.length;
        }
    }).catch(err => {
        document.getElementById('admin-revenue').innerText = "Backend Off";
        document.getElementById('admin-orders-count').innerText = "-";
    });
}

function adminUpdateStock(id, val) {
    const p = products.find(x => String(x.id) === String(id));
    if(p) { 
        p.stock = parseInt(val) || 0; 
        localStorage.setItem('kcProducts', JSON.stringify(products)); 
        showToast("Stock updated! (Locally)", "success"); 
    }
}

function adminDelete(id) {
    products = products.filter(x => String(x.id) !== String(id));
    localStorage.setItem('kcProducts', JSON.stringify(products));
    renderAdmin(); 
    showToast("Product deleted. (Locally)", "success");
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
