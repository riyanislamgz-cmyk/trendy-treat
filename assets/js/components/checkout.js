// Checkout will be rendered inside cart page itself when "Order Now" is clicked
function openCheckout() {
    navigate('/checkout');
}
function renderCheckout() {
    const items = DB.getCart();
    if (!items.length) {
        return `
        <section class="checkout-section">
            <h2><i class="fas fa-credit-card"></i> Checkout</h2>
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Add some items before checking out.</p>
                <a href="#/products" class="btn btn-primary"><i class="fas fa-shopping-bag"></i> Shop Now</a>
            </div>
        </section>`;
    }
    const total = DB.cartTotal() + (DB.cartTotal() >= 50 ? 0 : 5.99);
    return `
    <section class="checkout-section">
        <h2><i class="fas fa-credit-card"></i> Order Now</h2>
        <div class="checkout-form" id="checkoutForm">
            <div class="checkout-summary">
                <h4>Order Summary</h4>
                ${items.map(i => `<div style="display:flex;justify-content:space-between;font-size:.9rem;padding:4px 0"><span>${i.name} × ${i.qty}</span><span>$${(i.qty * i.price).toFixed(2)}</span></div>`).join('')}
                <div style="display:flex;justify-content:space-between;font-size:.9rem;padding:4px 0;border-top:1px solid var(--border);margin-top:8px;padding-top:8px"><span>Shipping</span><span>${DB.cartTotal() >= 50 ? '<span style="color:#2ecc71">FREE</span>' : '$5.99'}</span></div>
                <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.2rem;color:var(--primary);padding-top:12px;border-top:2px solid var(--primary);margin-top:12px"><span>Total</span><span>$${total.toFixed(2)}</span></div>
            </div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px">
                <h4 style="margin-bottom:12px;color:var(--primary-dark)"><i class="fas fa-user"></i> Your Information</h4>
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="cName" placeholder="Your full name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="cEmail" placeholder="your@email.com (optional)">
                </div>
                <div class="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" id="cPhone" placeholder="+880 1XXXXXXXXXX" required>
                </div>
                <div class="form-group">
                    <label>Delivery Address *</label>
                    <textarea id="cAddress" rows="3" placeholder="House, Road, Area, City, ZIP" required></textarea>
                </div>
                <div class="form-group">
                    <label>Any Notes? (optional)</label>
                    <textarea id="cNotes" placeholder="Gift message, delivery instructions..." rows="2"></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <div class="payment-methods">
                    <div class="payment-method active" onclick="selectPayment(this)">
                        <i class="fas fa-mobile-alt"></i>
                        <span>bKash/Nagad</span>
                    </div>
                    <div class="payment-method" onclick="selectPayment(this)">
                        <i class="fas fa-credit-card"></i>
                        <span>Credit Card</span>
                    </div>
                    <div class="payment-method" onclick="selectPayment(this)">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Cash on Delivery</span>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary btn-block" onclick="placeOrder()" style="padding:16px;font-size:1.1rem">
                <i class="fas fa-check-circle"></i> Confirm Order — $${total.toFixed(2)}
            </button>
            <p style="text-align:center;margin-top:12px;font-size:.85rem;color:var(--text-light)">
                <i class="fas fa-shield-alt"></i> Your information is secure. We never share your data.
            </p>
        </div>
    </section>`;
}
function selectPayment(el) {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
}
function placeOrder() {
    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    const address = document.getElementById('cAddress').value.trim();
    if (!name || !phone || !address) {
        Toast.show('Please provide your name, phone, and address', 'error');
        return;
    }
    if (phone.replace(/[\+\-\s]/g, '').length < 10) {
        Toast.show('Please enter a valid phone number', 'error');
        return;
    }
    const payment = document.querySelector('.payment-method.active span').textContent;
    const notes = document.getElementById('cNotes').value.trim();
    const customer = { name, email, phone, address, payment };
    const order = DB.createOrder(customer);
    updateCartCount();
    Toast.show('Order placed successfully! 🎉 Order ID: ' + order.id);
    navigate('/orders');
}