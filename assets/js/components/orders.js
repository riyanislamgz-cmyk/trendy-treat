function renderOrders() {
    const orders = DB.getOrders();
    if (!orders.length) {
        return `
        <section class="orders-section">
            <h2><i class="fas fa-clipboard-list"></i> My Orders</h2>
            <div class="order-empty">
                <i class="fas fa-clipboard-list"></i>
                <h3>No orders yet</h3>
                <p>You haven't placed any orders. Start shopping!</p>
                <a href="#/products" class="btn btn-primary"><i class="fas fa-shopping-bag"></i> Shop Now</a>
            </div>
        </section>`;
    }
    return `
    <section class="orders-section">
        <h2><i class="fas fa-clipboard-list"></i> My Orders <span style="font-size:1rem;color:var(--text-light);font-weight:400">(${orders.length} order${orders.length > 1 ? 's' : ''})</span></h2>
        <div class="orders-list">
            ${orders.map(o => `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <span class="order-id">${o.id}</span>
                            <span class="order-date">${new Date(o.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span class="order-status status-${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
                    </div>
                    <div class="order-items">
                        ${o.items.map(i => `
                            <div class="order-item">
                                <span>${i.name} × ${i.qty}</span>
                                <span>$${(i.qty * i.price).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:.9rem;color:var(--text-light);margin-top:8px">
                        <span>Shipping: $${o.shipping.toFixed(2)}</span>
                        <span>${o.customer.payment}</span>
                    </div>
                    <div class="order-total">Total: $${o.total.toFixed(2)}</div>
                    ${o.notes ? `<div style="font-size:.85rem;color:var(--text-light);margin-top:8px;padding:8px;background:#f8faf8;border-radius:8px"><strong>Notes:</strong> ${o.notes}</div>` : ''}
                    <div style="margin-top:12px;font-size:.85rem;color:var(--text-light)">
                        <i class="fas fa-map-marker-alt"></i> ${o.customer.address}
                    </div>
                </div>
            `).join('')}
        </div>
    </section>`;
}
