let loggedSupplier = null;
function renderSupplier() {
    if (!loggedSupplier) return renderSupplierLogin();
    const s = DB.getSuppliers().find(x => x.id === loggedSupplier);
    if (!s) { loggedSupplier = null; return renderSupplierLogin(); }
    const myProds = DB.products.filter(p => p.supplier === s.id);
    const myOrders = DB.getOrders().filter(o => o.items.some(i => {
        const p = DB.getProduct(i.id);
        return p && p.supplier === s.id;
    }));
    return `
    <section class="admin-section">
        <div class="admin-header">
            <h2><i class="fas fa-store"></i> ${s.name}'s Portal</h2>
            <button class="btn btn-sm btn-outline" onclick="logoutSupplier()"><i class="fas fa-sign-out-alt"></i> Logout</button>
        </div>
        <div class="admin-stats" style="margin-bottom:20px">
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-box"></i></div><div class="stat-num">${myProds.length}</div><div class="stat-label">My Products</div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-shopping-bag"></i></div><div class="stat-num">${myOrders.length}</div><div class="stat-label">Orders</div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-dollar-sign"></i></div><div class="stat-num">${DB.formatPrice(myOrders.reduce((sum, o) => sum + o.total, 0))}</div><div class="stat-label">Total Sales</div></div>
        </div>
        <h3 style="margin-bottom:16px"><i class="fas fa-box"></i> My Products — Set Your Price</h3>
        <p style="font-size:.85rem;color:var(--text-light);margin-bottom:16px">Set your wholesale price. Retail price (${DB.currencySymbol()} amount shown to customers) will be automatically +10% higher.</p>
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead><tr><th>Product</th><th>Your Price</th><th>Retail Price (+10%)</th><th>Actions</th></tr></thead>
                <tbody>${myProds.length ? myProds.map(p => {
                    const retail = DB.getRetailPrice(p);
                    const supP = p.supplierPrice || p.price;
                    return `<tr>
                        <td>${p.image} ${p.name}</td>
                        <td><input type="number" id="sp_${p.id}" value="${supP}" min="1" style="width:100px;padding:6px 10px;border:1px solid var(--border);border-radius:6px"></td>
                        <td><strong>${DB.formatPrice(retail)}</strong></td>
                        <td><button class="btn btn-sm btn-primary" onclick="updateSupplierPrice(${p.id})"><i class="fas fa-save"></i> Update</button></td>
                    </tr>`;
                }).join('') : '<tr><td colspan="4" style="text-align:center;padding:40px">No products assigned to you yet.</td></tr>'}</tbody>
            </table>
        </div>
        ${myOrders.length ? `
        <h3 style="margin:24px 0 16px"><i class="fas fa-clipboard-list"></i> My Orders</h3>
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>${myOrders.map(o => `<tr>
                    <td><strong>${o.id}</strong><br><span style="font-size:.8rem;color:var(--text-light)">${new Date(o.date).toLocaleDateString()}</span></td>
                    <td>${o.customer.name}<br><span style="font-size:.8rem;color:var(--text-light)">${o.customer.phone}</span></td>
                    <td>${o.items.filter(i => { const p = DB.getProduct(i.id); return p && p.supplier === s.id; }).map(i => `${i.name} x ${i.qty}`).join('<br>')}</td>
                    <td><strong>${DB.formatPrice(o.items.filter(i => { const p = DB.getProduct(i.id); return p && p.supplier === s.id; }).reduce((sum, i) => sum + i.qty * i.price, 0))}</strong></td>
                    <td><span class="order-status status-${o.status}">${o.status}</span></td>
                </tr>`).join('')}</tbody>
            </table>
        </div>` : ''}
    </section>`;
}
function renderSupplierLogin() {
    return `
    <section class="admin-section" style="max-width:400px;margin:60px auto">
        <div style="text-align:center;margin-bottom:32px">
            <div style="font-size:3rem;margin-bottom:12px">🔐</div>
            <h2>Supplier Login</h2>
            <p style="color:var(--text-light);font-size:.9rem">Enter your PIN to manage your products</p>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:24px">
            <div class="form-group"><label>Your Name</label>
                <select id="supLoginName" style="width:100%"><option value="">Select your name...</option>${DB.getSuppliers().map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select>
            </div>
            <div class="form-group"><label>PIN</label>
                <input type="password" id="supLoginPin" placeholder="Enter your 4-digit PIN" maxlength="4" style="width:100%;text-align:center;font-size:1.4rem;letter-spacing:8px">
            </div>
            <button class="btn btn-primary btn-block" onclick="loginSupplier()"><i class="fas fa-lock-open"></i> Login</button>
        </div>
        <p style="text-align:center;margin-top:20px;font-size:.85rem;color:var(--text-light)">Contact the store admin if you don't have a PIN.</p>
    </section>`;
}
function loginSupplier() {
    const id = document.getElementById('supLoginName').value;
    const pin = document.getElementById('supLoginPin').value.trim();
    if (!id || !pin) { Toast.show('Select your name and enter PIN', 'error'); return; }
    const s = DB.getSuppliers().find(x => x.id === id);
    if (!s || s.pin !== pin) { Toast.show('Invalid PIN', 'error'); return; }
    loggedSupplier = id;
    navigate('/supplier');
}
function logoutSupplier() {
    loggedSupplier = null;
    navigate('/supplier');
}
function updateSupplierPrice(pid) {
    const val = parseFloat(document.getElementById('sp_' + pid).value);
    if (!val || val <= 0) { Toast.show('Enter a valid price', 'error'); return; }
    DB.setSupplierPrice(pid, val);
    render();
    Toast.show('Price updated! Retail: ' + DB.formatPrice(DB.getProduct(pid).price));
}
