function renderCart() {
    const items = DB.getCart();
    if (!items.length) {
        return `
        <section class="cart-section">
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
                            <p>$${i.price.toFixed(2)} each</p>
                            <div class="cart-item-qty">
                                <button class="qty-btn" onclick="updateQty(${i.id}, ${i.qty - 1})" ${i.qty <= 1 ? 'disabled' : ''}><i class="fas fa-minus"></i></button>
                                <span>${i.qty}</span>
                                <button class="qty-btn" onclick="updateQty(${i.id}, ${i.qty + 1})"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <div class="cart-item-total">
                            <div class="price">$${(i.qty * i.price).toFixed(2)}</div>
                            <button class="remove-item" onclick="removeItem(${i.id})"><i class="fas fa-trash-alt"></i> Remove</button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row"><span>Subtotal</span><span>$${DB.cartTotal().toFixed(2)}</span></div>
                <div class="summary-row"><span>Shipping</span><span>${DB.cartTotal() >= 50 ? 'FREE' : '$5.99'}</span></div>
                <div class="summary-row total"><span>Total</span><span>$${(DB.cartTotal() + (DB.cartTotal() >= 50 ? 0 : 5.99)).toFixed(2)}</span></div>
                <p style="font-size:.8rem;color:var(--text-light);margin:8px 0 16px">Free shipping on orders over $50</p>
                <a href="#/checkout" class="btn btn-primary btn-block"><i class="fas fa-lock"></i> Checkout</a>
                <button class="btn btn-outline btn-block" style="margin-top:8px" onclick="clearCart()"><i class="fas fa-trash"></i> Clear Cart</button>
            </div>
        </div>
    </section>`;
}
function updateQty(id, qty) {
    DB.updateQty(id, qty);
    updateCartCount();
    render();
}
function removeItem(id) {
    DB.removeFromCart(id);
    updateCartCount();
    render();
    Toast.show('Item removed from cart');
}
function clearCart() {
    if (confirm('Clear your entire cart?')) {
        DB.clearCart();
        updateCartCount();
        render();
        Toast.show('Cart cleared');
    }
}
