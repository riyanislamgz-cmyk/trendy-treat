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
    return `
    <section class="checkout-section">
        <h2><i class="fas fa-credit-card"></i> Checkout</h2>
        <div class="checkout-form" id="checkoutForm">
            <div class="checkout-summary">
                <h4>Order Summary</h4>
                ${items.map(i => `<div style="display:flex;justify-content:space-between;font-size:.9rem;padding:4px 0"><span>${i.name} × ${i.qty}</span><span>$${(i.qty * i.price).toFixed(2)}</span></div>`).join('')}
                <div style="display:flex;justify-content:space-between;font-size:.9rem;padding:4px 0;border-top:1px solid var(--border);margin-top:8px;padding-top:8px"><span>Shipping</span><span>${DB.cartTotal() >= 50 ? 'FREE' : '$5.99'}</span></div>
                <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.1rem;color:var(--primary);padding-top:8px"><span>Total</span><span>$${(DB.cartTotal() + (DB.cartTotal() >= 50 ? 0 : 5.99)).toFixed(2)}</span></div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" id="cfName" placeholder="John" required>
                </div>
                <div class="form-group">
                    <label>Last Name *</label>
                    <input type="text" id="clName" placeholder="Doe" required>
                </div>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="cEmail" placeholder="john@example.com" required>
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" id="cPhone" placeholder="+1 (555) 123-4567" required>
            </div>
            <div class="form-group">
                <label>Delivery Address *</label>
                <textarea id="cAddress" placeholder="123 Main St, City, ZIP" required></textarea>
            </div>
            <div class="form-group">
                <label>Delivery Notes</label>
                <textarea id="cNotes" placeholder="Special instructions, gift message, etc."></textarea>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <div class="payment-methods">
                    <div class="payment-method active" onclick="selectPayment(this)">
                        <i class="fas fa-credit-card"></i>
                        <span>Credit Card</span>
                    </div>
                    <div class="payment-method" onclick="selectPayment(this)">
                        <i class="fas fa-mobile-alt"></i>
                        <span>Mobile Pay</span>
                    </div>
                    <div class="payment-method" onclick="selectPayment(this)">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Cash on Delivery</span>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary btn-block" onclick="placeOrder()" style="padding:16px;font-size:1.1rem">
                <i class="fas fa-lock"></i> Place Order — $${(DB.cartTotal() + (DB.cartTotal() >= 50 ? 0 : 5.99)).toFixed(2)}
            </button>
        </div>
    </section>`;
}
function selectPayment(el) {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
}
function placeOrder() {
    const fName = document.getElementById('cfName').value.trim();
    const lName = document.getElementById('clName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    const address = document.getElementById('cAddress').value.trim();
    if (!fName || !lName || !email || !phone || !address) {
        Toast.show('Please fill in all required fields', 'error');
        return;
    }
    if (!email.includes('@')) { Toast.show('Please enter a valid email', 'error'); return; }
    const payment = document.querySelector('.payment-method.active span').textContent;
    const notes = document.getElementById('cNotes').value.trim();
    const customer = { fName, lName, email, phone, address, payment };
    const order = DB.createOrder(customer);
    updateCartCount();
    Toast.show('Order placed successfully! 🎉 Order ID: ' + order.id);
    navigate('/orders');
}
