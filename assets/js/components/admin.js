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
            <button class="admin-tab ${adminTab === 'dropship' ? 'active' : ''}" onclick="adminTab='dropship';render()"><i class="fas fa-truck"></i> Dropship</button>
        </div>
        ${adminTab === 'dashboard' ? renderAdminDashboard(stats) : ''}
        ${adminTab === 'orders' ? renderAdminOrders(orders) : ''}
        ${adminTab === 'products' ? renderAdminProducts(inv) : ''}
        ${adminTab === 'settings' ? renderAdminSettings(settings) : ''}
        ${adminTab === 'dropship' ? renderDropship() : ''}
    </section>`;
}
function renderAdminDashboard(stats) {
    return `
    <div class="admin-stats">
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-shopping-bag"></i></div><div class="stat-num">${stats.totalOrders}</div><div class="stat-label">Total Orders</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div><div class="stat-num">${DB.formatPrice(stats.revenue)}</div><div class="stat-label">Total Revenue</div></div>
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
                        <td>${o.customer.name}<br><span style="font-size:.8rem;color:var(--text-light)">${o.customer.phone}</span></td>
                        <td>${o.items.reduce((s, i) => s + i.qty, 0)} items</td>
                        <td>$${DB.formatPrice(o.total)}</td>
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
                        <td><strong>$${DB.formatPrice(o.total)}</strong><br><span style="font-size:.8rem;color:var(--text-light)">${o.customer.payment}</span></td>
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
        <div class="form-group"><label>Supplier (for dropshipping)</label>
            <select id="apSupplier"><option value="">None (own stock)</option>${DB.getSuppliers().map(s => `<option value="${s.id}">${s.name} - ${s.phone}</option>`).join('')}</select>
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
                        <td>$${DB.formatPrice(p.price)}</td>
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
    const supplier = document.getElementById('apSupplier').value || '';
    if (!name || !price || isNaN(price)) { Toast.show('Name and valid price are required', 'error'); return; }
    if (price <= 0) { Toast.show('Price must be greater than 0', 'error'); return; }
    if (editingProductId) {
        const p = DB.getProduct(editingProductId);
        if (p) { Object.assign(p, { name, category: cat, price, oldPrice, desc, image, badge, supplier }); }
        editingProductId = null;
        Toast.show('Product updated!');
    } else {
        const maxId = Math.max(...DB.products.map(p => p.id), 0);
        DB.products.push({ id: maxId + 1, name, category: cat, price, oldPrice, rating: 0, reviews: 0, image, badge, desc, supplier });
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
    document.getElementById('apSupplier').value = p.supplier || '';
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
    document.getElementById('apSupplier').value = '';
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
function renderDropship() {
    const suppliers = DB.getSuppliers();
    const orders = DB.getOrders();
    return `
    <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px">
        <div class="add-product-form" style="flex:1;min-width:300px">
            <h3><i class="fas fa-user-plus"></i> Add Supplier</h3>
            <div class="form-group"><label>Name *</label><input type="text" id="dsName" placeholder="Supplier name"></div>
            <div class="form-group"><label>Phone *</label><input type="tel" id="dsPhone" placeholder="+880 1XXXXXXXXXX"></div>
            <div class="form-group"><label>Note</label><textarea id="dsNote" rows="2" placeholder="Delivery area, products they supply, etc."></textarea></div>
            <button class="btn btn-primary" onclick="addSupplier()"><i class="fas fa-save"></i> Save Supplier</button>
        </div>
        <div class="add-product-form" style="flex:1;min-width:300px">
            <h3><i class="fas fa-info-circle"></i> How Dropshipping Works</h3>
            <div style="font-size:.9rem;line-height:1.8;color:var(--text-light)">
                <p>1️⃣ Add suppliers above with their phone numbers</p>
                <p>2️⃣ Edit each product → assign a supplier</p>
                <p>3️⃣ When order comes, click <strong>Forward</strong> to send details to supplier via WhatsApp</p>
                <p>4️⃣ Supplier delivers directly to your customer</p>
            </div>
        </div>
    </div>
    ${suppliers.length ? `
    <div class="admin-table-wrap" style="margin-bottom:20px">
        <table class="admin-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Note</th><th>Actions</th></tr></thead>
            <tbody>${suppliers.map(s => `
                <tr>
                    <td><strong>${s.name}</strong></td>
                    <td><a href="https://wa.me/${s.phone.replace(/[^0-9]/g,'')}" target="_blank">${s.phone}</a></td>
                    <td style="font-size:.85rem;color:var(--text-light)">${s.note || ''}</td>
                    <td><button class="del-btn" onclick="deleteSupplier('${s.id}')"><i class="fas fa-trash"></i></button></td>
                </tr>
            `).join('')}</tbody>
        </table>
    </div>` : '<p style="text-align:center;padding:40px;color:var(--text-light)">No suppliers yet. Add your dropshipping suppliers above.</p>'}
    <h3 style="margin-bottom:16px"><i class="fas fa-clipboard-list"></i> Orders to Forward</h3>
    ${orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length ? `
    <div class="admin-table-wrap">
        <table class="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Supplier</th><th>Action</th></tr></thead>
            <tbody>${orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map(o => {
                const hasSupplier = o.items.some(i => {
                    const p = DB.getProduct(i.id);
                    return p && p.supplier;
                });
                return `<tr>
                    <td><strong>${o.id}</strong><br><span style="font-size:.8rem;color:var(--text-light)">${new Date(o.date).toLocaleDateString()}</span></td>
                    <td>${o.customer.name}<br><span style="font-size:.8rem;color:var(--text-light)">${o.customer.phone}</span></td>
                    <td>${o.items.map(i => {
                        const p = DB.getProduct(i.id);
                        const sup = p && p.supplier ? suppliers.find(s => s.id === p.supplier) : null;
                        return `<div>${i.name} x ${i.qty}${sup ? '<br><span style="font-size:.75rem;color:var(--primary)">→ ' + sup.name + '</span>' : ''}</div>`;
                    }).join('')}</td>
                    <td>${hasSupplier ? '<span style="color:#2ecc71">Ready</span>' : '<span style="color:var(--text-light)">No supplier</span>'}</td>
                    <td><button class="btn btn-sm btn-primary" onclick="forwardOrder('${o.id}')" ${hasSupplier ? '' : 'disabled'}><i class="fab fa-whatsapp"></i> Forward</button></td>
                </tr>`;
            }).join('')}</tbody>
        </table>
    </div>` : '<p style="text-align:center;padding:40px;color:var(--text-light)">No pending orders to forward</p>'}
    `;
}
function addSupplier() {
    const name = document.getElementById('dsName').value.trim();
    const phone = document.getElementById('dsPhone').value.trim();
    const note = document.getElementById('dsNote').value.trim();
    if (!name || !phone) { Toast.show('Name and phone are required', 'error'); return; }
    const suppliers = DB.getSuppliers();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    suppliers.push({ id: 'sup_' + Date.now().toString(36), name, phone, note, pin });
    DB.saveSuppliers(suppliers);
    document.getElementById('dsName').value = '';
    document.getElementById('dsPhone').value = '';
    document.getElementById('dsNote').value = '';
    Toast.show('Supplier added! PIN: ' + pin);
    render();
}
function deleteSupplier(id) {
    if (confirm('Delete this supplier?')) {
        DB.saveSuppliers(DB.getSuppliers().filter(s => s.id !== id));
        Toast.show('Supplier deleted');
        render();
    }
}
function forwardOrder(orderId) {
    const o = DB.getOrders().find(o => o.id === orderId);
    if (!o) return;
    const suppliers = DB.getSuppliers();
    const msg = [];
    msg.push('🛒 *NEW ORDER*');
    msg.push('Order: ' + o.id);
    msg.push('Date: ' + new Date(o.date).toLocaleString());
    msg.push('');
    msg.push('*Customer:*');
    msg.push('Name: ' + o.customer.name);
    msg.push('Phone: ' + o.customer.phone);
    msg.push('Address: ' + o.customer.address);
    msg.push('Payment: ' + o.customer.payment);
    msg.push('');
    msg.push('*Items:*');
    o.items.forEach(i => {
        const p = DB.getProduct(i.id);
        const sup = p && p.supplier ? suppliers.find(s => s.id === p.supplier) : null;
        msg.push('• ' + i.name + ' x ' + i.qty + ' = ' + DB.formatPrice(i.qty * i.price));
        if (sup) msg.push('  Supplier: ' + sup.name + ' (' + sup.phone + ')');
    });
    msg.push('');
    msg.push('Total: ' + DB.formatPrice(o.total));
    msg.push('Delivery: ' + (o.customer.address.split(',').pop() || 'Bangladesh'));
    const encoded = encodeURIComponent(msg.join('\n'));
    const uniqueSuppliers = [...new Set(o.items.map(i => {
        const p = DB.getProduct(i.id);
        return p && p.supplier ? p.supplier : null;
    }).filter(Boolean))];
    if (uniqueSuppliers.length === 1) {
        const sup = suppliers.find(s => s.id === uniqueSuppliers[0]);
        if (sup) {
            window.open('https://wa.me/' + sup.phone.replace(/[^0-9]/g,'') + '?text=' + encoded, '_blank');
            DB.updateOrderStatus(o.id, 'forwarded', 'Forwarded to ' + sup.name);
            Toast.show('Forwarded to ' + sup.name);
            render();
            return;
        }
    }
    window.open('https://wa.me/?text=' + encoded, '_blank');
    DB.updateOrderStatus(o.id, 'forwarded', 'Forwarded to supplier');
    Toast.show('Order info copied. Send to your supplier on WhatsApp.');
    render();
}
