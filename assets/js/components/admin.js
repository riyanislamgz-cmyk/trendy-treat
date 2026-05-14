let adminTab = 'dashboard';
let editingProductId = null;
function renderAdmin() {
    const stats = DB.getStats();
    const orders = DB.getOrders();
    const inv = DB.getInventory();
    const settings = DB.getSettings();
    return `
    <section class="admin-section">
        <div class="admin-header">
            <h2><i class="fas fa-shield-alt"></i> Admin Panel</h2>
            <button class="btn btn-sm btn-outline" onclick="adminTab='settings';render()"><i class="fas fa-cog"></i> Settings</button>
        </div>
        <div class="admin-tabs">
            <button class="admin-tab ${adminTab === 'dashboard' ? 'active' : ''}" onclick="adminTab='dashboard';render()"><i class="fas fa-chart-bar"></i> Dashboard</button>
            <button class="admin-tab ${adminTab === 'orders' ? 'active' : ''}" onclick="adminTab='orders';render()"><i class="fas fa-clipboard-list"></i> Orders (${stats.pending})</button>
            <button class="admin-tab ${adminTab === 'products' ? 'active' : ''}" onclick="adminTab='products';render()"><i class="fas fa-box"></i> Products</button>
            <button class="admin-tab ${adminTab === 'settings' ? 'active' : ''}" onclick="adminTab='settings';render()"><i class="fas fa-cog"></i> Settings</button>
        </div>
        ${adminTab === 'dashboard' ? renderAdminDashboard(stats) : ''}
        ${adminTab === 'orders' ? renderAdminOrders(orders) : ''}
        ${adminTab === 'products' ? renderAdminProducts(inv) : ''}
        ${adminTab === 'settings' ? renderAdminSettings(settings) : ''}
    </section>`;
}
function renderAdminDashboard(stats) {
    return `
    <div class="admin-stats">
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-shopping-bag"></i></div><div class="stat-num">${stats.totalOrders}</div><div class="stat-label">Total Orders</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-dollar-sign"></i></div><div class="stat-num">$${stats.revenue.toFixed(2)}</div><div class="stat-label">Total Revenue</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-clock"></i></div><div class="stat-num">${stats.pending}</div><div class="stat-label">Pending Orders</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-num">${stats.completed}</div><div class="stat-label">Completed</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-box"></i></div><div class="stat-num">${stats.products}</div><div class="stat-label">Products</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-truck"></i></div><div class="stat-num">${stats.totalSold}</div><div class="stat-label">Items Sold</div></div>
    </div>
    <div class="admin-table-wrap">
        <table class="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
                ${DB.getOrders().slice(0, 10).map(o => `
                    <tr>
                        <td><strong>${o.id}</strong><br><span style="font-size:.8rem;color:var(--text-light)">${new Date(o.date).toLocaleDateString()}</span></td>
                        <td>${o.customer.fName} ${o.customer.lName}<br><span style="font-size:.8rem;color:var(--text-light)">${o.customer.email}</span></td>
                        <td>${o.items.reduce((s, i) => s + i.qty, 0)} items</td>
                        <td>$${o.total.toFixed(2)}</td>
                        <td><span class="order-status status-${o.status}">${o.status}</span></td>
                        <td><button class="btn btn-sm btn-outline" onclick="adminTab='orders';render()">View</button></td>
                    </tr>
                `).join('') || '<tr><td colspan="6" style="text-align:center;padding:40px">No orders yet</td></tr>'}
            </tbody>
        </table>
    </div>`;
}
function renderAdminOrders(orders) {
    return `
    <div class="admin-search">
        <i class="fas fa-search"></i>
        <input type="text" id="adminOrderSearch" placeholder="Search by order ID or customer name..." oninput="filterAdminOrders(this.value)">
    </div>
    <div class="admin-table-wrap">
        <table class="admin-table" id="adminOrdersTable">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
                ${orders.map(o => `
                    <tr class="admin-order-row">
                        <td><strong>${o.id}</strong></td>
                        <td>${o.customer.name}<br><span style="font-size:.8rem;color:var(--text-light)">${o.customer.phone}</span></td>
                        <td>${o.items.map(i => `${i.name} x ${i.qty}`).join('<br>')}</td>
                        <td><strong>$${o.total.toFixed(2)}</strong><br><span style="font-size:.8rem;color:var(--text-light)">${o.customer.payment}</span></td>
                        <td style="font-size:.85rem">${new Date(o.date).toLocaleDateString()}</td>
                        <td>
                            <select onchange="updateOrderStatus('${o.id}', this.value)" class="order-status-select" style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:.8rem">
                                <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td class="actions">
                            <button onclick="showOrderDetails('${o.id}')" title="View"><i class="fas fa-eye"></i></button>
                            <button class="del-btn" onclick="deleteOrder('${o.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('') || '<tr><td colspan="7" style="text-align:center;padding:40px">No orders yet</td></tr>'}
            </tbody>
        </table>
    </div>`;
}
function renderAdminProducts(inv) {
    return `
    <div class="add-product-form" id="productForm">
        <h3 id="formTitle"><i class="fas fa-plus-circle"></i> Add Product</h3>
        <div class="form-row">
            <div class="form-group"><label>Product Name *</label><input type="text" id="apName" placeholder="Premium Chocolate Box"></div>
            <div class="form-group"><label>Category</label><select id="apCat">${DB.categories.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Price ($) *</label><input type="number" id="apPrice" step="0.01" placeholder="29.99"></div>
            <div class="form-group"><label>Old Price ($)</label><input type="number" id="apOldPrice" step="0.01" placeholder="39.99"></div>
        </div>
        <div class="form-group"><label>Description</label><textarea id="apDesc" placeholder="Product description..."></textarea></div>
        <div class="form-row">
            <div class="form-group"><label>Image URL</label><input type="url" id="apImage" placeholder="https://example.com/image.jpg">
                <span style="font-size:.75rem;color:var(--text-light)">Or use emoji: 🍫 🎂 🍪 🎁 💐</span>
            </div>
            <div class="form-group"><label>Badge</label><select id="apBadge"><option value="">None</option><option value="new">New</option><option value="sale">Sale</option><option value="popular">Popular</option></select></div>
        </div>
        <div id="imagePreview" style="margin-bottom:12px;display:none"><img id="previewImg" src="" style="width:80px;height:80px;border-radius:8px;object-fit:cover;border:2px solid var(--border)"></div>
        <div style="display:flex;gap:8px">
            <button class="btn btn-primary" onclick="saveProduct()"><i class="fas fa-save"></i> <span id="saveBtnText">Add Product</span></button>
            <button class="btn btn-outline" onclick="cancelEdit()" id="cancelBtn" style="display:none"><i class="fas fa-times"></i> Cancel</button>
        </div>
    </div>
    <div class="admin-table-wrap">
        <table class="admin-table">
            <thead><tr><th>ID</th><th>Product</th><th>Category</th><th>Price</th><th>Sold</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
                ${DB.products.map(p => {
                    const isUrl = p.image && (p.image.startsWith('http') || p.image.startsWith('data:'));
                    return `
                    <tr>
                        <td>#${p.id}</td>
                        <td>${isUrl ? `<img src="${p.image}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;vertical-align:middle;margin-right:6px">` : p.image} ${p.name}</td>
                        <td>${DB.categories.find(c => c.id === p.category)?.name || p.category}</td>
                        <td>$${p.price.toFixed(2)}</td>
                        <td>${20 - (inv[p.id] || 20)}</td>
                        <td>${inv[p.id] ?? 20}</td>
                        <td class="actions">
                            <button onclick="editProduct(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="del-btn" onclick="deleteProduct(${p.id})" title="Delete"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`;
}
function renderAdminSettings(settings) {
    return `
    <div class="add-product-form">
        <h3><i class="fas fa-cog"></i> Store Settings</h3>
        <div class="form-group"><label>Store Name</label><input type="text" id="sStoreName" value="${settings.storeName}"></div>
        <div class="form-group"><label>Currency</label><select id="sCurrency"><option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option><option value="BDT" ${settings.currency === 'BDT' ? 'selected' : ''}>BDT (৳)</option><option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option></select></div>
        <div class="form-group"><label>Gemini API Key <span style="font-size:.8rem;color:var(--text-light)">(for AI assistant)</span></label>
            <input type="password" id="sGeminiKey" value="${settings.geminiKey}" placeholder="Enter your Gemini API key">
            <p style="font-size:.8rem;color:var(--text-light);margin-top:4px">Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com</a></p>
        </div>
        <button class="btn btn-primary" onclick="saveAdminSettings()"><i class="fas fa-save"></i> Save Settings</button>
    </div>`;
}
function filterAdminOrders(val) {
    const q = val.toLowerCase();
    document.querySelectorAll('.admin-order-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}
function updateOrderStatus(id, status) {
    if (DB.updateOrderStatus(id, status)) { Toast.show('Order ' + id + ' updated to ' + status); render(); }
}
function showOrderDetails(id) {
    const o = DB.getOrders().find(o => o.id === id);
    if (!o) return;
    const msg = 'Order: ' + o.id + '\nCustomer: ' + o.customer.name + '\nPhone: ' + o.customer.phone + '\nAddress: ' + o.customer.address + '\nPayment: ' + o.customer.payment + o.items.map(i => '\n  ' + i.name + ' x ' + i.qty + ' = $' + (i.qty * i.price).toFixed(2)).join('') + '\nTotal: $' + o.total.toFixed(2) + '\nStatus: ' + o.status + '\nDate: ' + new Date(o.date).toLocaleString();
    alert(msg);
}
function deleteOrder(id) {
    if (confirm('Delete order ' + id + '?')) {
        DB.saveOrders(DB.getOrders().filter(o => o.id !== id));
        Toast.show('Order deleted');
        render();
    }
}
function saveProduct() {
    const name = document.getElementById('apName').value.trim();
    const cat = document.getElementById('apCat').value;
    const price = parseFloat(document.getElementById('apPrice').value);
    const oldPrice = parseFloat(document.getElementById('apOldPrice').value) || null;
    const desc = document.getElementById('apDesc').value.trim();
    const image = document.getElementById('apImage').value.trim() || '🎁';
    const badge = document.getElementById('apBadge').value || null;
    if (!name || !price || isNaN(price)) { Toast.show('Name and valid price are required', 'error'); return; }
    if (price <= 0) { Toast.show('Price must be greater than 0', 'error'); return; }
    if (editingProductId) {
        const p = DB.getProduct(editingProductId);
        if (p) { Object.assign(p, { name, category: cat, price, oldPrice, desc, image, badge }); }
        editingProductId = null;
        Toast.show('Product updated!');
    } else {
        const maxId = Math.max(...DB.products.map(p => p.id), 0);
        DB.products.push({ id: maxId + 1, name, category: cat, price, oldPrice, rating: 0, reviews: 0, image, badge, desc });
        Toast.show('Product added!');
    }
    cancelEdit();
    render();
}
function editProduct(id) {
    const p = DB.getProduct(id);
    if (!p) return;
    editingProductId = id;
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Product #' + id;
    document.getElementById('saveBtnText').textContent = 'Update Product';
    document.getElementById('apName').value = p.name;
    document.getElementById('apCat').value = p.category;
    document.getElementById('apPrice').value = p.price;
    document.getElementById('apOldPrice').value = p.oldPrice || '';
    document.getElementById('apDesc').value = p.desc;
    document.getElementById('apImage').value = p.image;
    document.getElementById('apBadge').value = p.badge || '';
    document.getElementById('cancelBtn').style.display = '';
    showImagePreview(p.image);
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}
function cancelEdit() {
    editingProductId = null;
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add Product';
    document.getElementById('saveBtnText').textContent = 'Add Product';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('apName').value = '';
    document.getElementById('apPrice').value = '';
    document.getElementById('apOldPrice').value = '';
    document.getElementById('apDesc').value = '';
    document.getElementById('apImage').value = '';
    document.getElementById('apBadge').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}
function showImagePreview(url) {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImg');
    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
        img.src = url; preview.style.display = '';
    } else { preview.style.display = 'none'; }
}
function deleteProduct(id) {
    if (confirm('Delete product #' + id + '?')) {
        const idx = DB.products.findIndex(p => p.id === id);
        if (idx > -1) { DB.products.splice(idx, 1); Toast.show('Product deleted'); render(); }
    }
}
function saveAdminSettings() {
    const settings = {
        storeName: document.getElementById('sStoreName').value.trim() || 'Trendy Treat',
        currency: document.getElementById('sCurrency').value,
        geminiKey: document.getElementById('sGeminiKey').value.trim()
    };
    DB.saveSettings(settings);
    Gemini.init();
    Toast.show('Settings saved!');
    render();
}
