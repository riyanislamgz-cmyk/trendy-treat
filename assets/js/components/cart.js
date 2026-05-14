function renderCart() {
    const items = DB.getCart();
    if (!items.length) {
        return `
        <section class="checkout-section">
            <h2><i class="fas fa-shopping-bag"></i> Your Cart</h2>
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet. Let's change that!</p>
                <a href="#/products" class="btn btn-primary"><i class="fas fa-shopping-bag"></i> Start Shopping</a>
            </div>
        </section>`;
    }
    return `
    <section class="cart-section">
        <h2><i class="fas fa-shopping-bag"></i> Your Cart <span style="font-size:1rem;color:var(--text-light);font-weight:400">(${items.length} item${items.length > 1 ? 's' : ''})</span></h2>
        <div class="cart-layout">
            <div class="cart-items">
                ${items.map(i => {
                    const p = DB.getProduct(i.id);
                    return `
                    <div class="cart-item">
                        <div class="cart-item-img">${i.image && (i.image.startsWith('http') || i.image.startsWith('data:')) ? `<img src="${i.image}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">` : (i.image || '🎁')}</div>
                        <div class="cart-item-info">
                            <h4>${i.name}</h4>
                            <p>$${DB.formatPrice(i.price)} each</p>
                            <div class="cart-item-qty">
                                <button class="qty-btn" onclick="updateQty(${i.id}, ${i.qty - 1})" ${i.qty <= 1 ? 'disabled' : ''}><i class="fas fa-minus"></i></button>
                                <span>${i.qty}</span>
                                <button class="qty-btn" onclick="updateQty(${i.id}, ${i.qty + 1})"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <div class="cart-item-total">
                            <div class="price">$${DB.formatPrice(i.qty * i.price)}</div>
                            <button class="remove-item" onclick="removeItem(${i.id})"><i class="fas fa-trash-alt"></i> Remove</button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row"><span>Subtotal</span><span>$${DB.formatPrice(DB.cartTotal())}</span></div>
                <div class="summary-row"><span>Shipping</span><span>${DB.cartTotal() >= DB.freeThreshold() ? '<span style="color:#2ecc71">FREE</span>' : DB.formatPrice(DB.shipping())}</span></div>
                <div class="summary-row total"><span>Total</span><span>$${DB.formatPrice(DB.cartTotal() + (DB.cartTotal() >= DB.freeThreshold() ? 0 : DB.shipping()))}</span></div>
                <p style="font-size:.8rem;color:var(--text-light);margin:8px 0 16px">Free shipping on orders over ${DB.freeThresholdFormatted()}</p>
                <button class="btn btn-primary btn-block" onclick="openCheckout()"><i class="fas fa-check-circle"></i> Order Now</button>
                <button class="btn btn-outline btn-block" style="margin-top:8px" onclick="clearCart()"><i class="fas fa-trash"></i> Clear Cart</button>
            </div>
        </div>
    </section>
    <!-- Checkout Modal -->
    <div class="modal-overlay" id="checkoutModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-credit-card"></i> Place Your Order</h3>
                <button class="modal-close" onclick="closeCheckout()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" style="max-height:70vh;overflow-y:auto;padding:20px">
                <div class="order-details-preview" style="background:var(--bg);border-radius:var(--radius-sm);padding:16px;margin-bottom:16px">
                    <h4 style="margin-bottom:8px;font-size:.95rem">📦 Items (${items.length})</h4>
                    ${items.map(i => `<div style="display:flex;justify-content:space-between;font-size:.85rem;padding:3px 0"><span>${i.name} × ${i.qty}</span><span style="font-weight:600">$${DB.formatPrice(i.qty * i.price)}</span></div>`).join('')}
                    <div style="display:flex;justify-content:space-between;font-size:.9rem;padding:6px 0;border-top:1px solid var(--border);margin-top:8px">
                        <span>Shipping</span><span>${DB.cartTotal() >= DB.freeThreshold() ? '<span style="color:#2ecc71">FREE</span>' : DB.formatPrice(DB.shipping())}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.1rem;color:var(--primary);padding-top:8px;border-top:2px solid var(--primary)">
                        <span>Total</span><span>$${DB.formatPrice(DB.cartTotal() + (DB.cartTotal() >= DB.freeThreshold() ? 0 : DB.shipping()))}</span>
                    </div>
                </div>
                <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px">
                    <h4 style="margin-bottom:12px;color:var(--primary-dark)"><i class="fas fa-user"></i> Your Information</h4>
                    <div class="form-group"><label>Full Name *</label><input type="text" id="mcName" placeholder="Your full name" required style="width:100%"></div>
                    <div class="form-group"><label>Phone Number *</label><input type="tel" id="mcPhone" placeholder="+880 1XXXXXXXXXX" required style="width:100%"></div>
                    <div class="form-group"><label>Delivery Address *</label><textarea id="mcAddress" rows="3" placeholder="House, Road, Area, City, ZIP" required style="width:100%"></textarea></div>
                    <div class="form-group"><label>Payment Method</label>
                        <div class="payment-methods">
                            <div class="payment-method active" onclick="selectCheckoutPayment(this)"><i class="fas fa-mobile-alt"></i><span>bKash/Nagad</span></div>
                            <div class="payment-method" onclick="selectCheckoutPayment(this)"><i class="fas fa-credit-card"></i><span>Card</span></div>
                            <div class="payment-method" onclick="selectCheckoutPayment(this)"><i class="fas fa-money-bill-wave"></i><span>Cash</span></div>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary btn-block" onclick="placeCheckoutOrder()" style="padding:16px;font-size:1.1rem"><i class="fas fa-check-circle"></i> Confirm Order</button>
                <button class="btn btn-outline btn-block" style="margin-top:8px" onclick="closeCheckout()">Cancel</button>
            </div>
        </div>
    </div>`;
}

let checkoutPaymentMethod = 'bKash/Nagad';

function selectCheckoutPayment(el) {
    el.parentElement.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
    checkoutPaymentMethod = el.querySelector('span').textContent;
}

function openCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}

function placeCheckoutOrder() {
    const name = document.getElementById('mcName').value.trim();
    const phone = document.getElementById('mcPhone').value.trim();
    const address = document.getElementById('mcAddress').value.trim();
    if (!name || !phone || !address) { Toast.show('Please fill in all required fields', 'error'); return; }
    if (phone.replace(/[\+\-\s]/g, '').length < 10) { Toast.show('Please enter a valid phone number', 'error'); return; }
    const customer = { name, email: '', phone, address, payment: checkoutPaymentMethod };
    const order = DB.createOrder(customer);
    updateCartCount();
    closeCheckout();
    Toast.show('Order placed successfully! 🎉 Order ID: ' + order.id);
    navigate('/orders');
}

function updateQty(id, qty) { DB.updateQty(id, qty); updateCartCount(); render(); }
function removeItem(id) { DB.removeFromCart(id); updateCartCount(); render(); Toast.show('Item removed'); }
function clearCart() { if (confirm('Clear your entire cart?')) { DB.clearCart(); updateCartCount(); render(); Toast.show('Cart cleared'); } }