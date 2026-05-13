function renderHero() {
    return `
    <section class="hero">
        <div class="hero-content">
            <div class="hero-badge">🌿 New Spring Collection</div>
            <h1>Trendy <span class="brand-leaf"><i class="fas fa-leaf"></i></span> Treat</h1>
            <p>Discover handcrafted premium treats & gifts. Every product tells a story of love, care, and perfection. 🌿</p>
            <div class="hero-btns">
                <a href="#/products" class="btn btn-primary"><i class="fas fa-shopping-bag"></i> Shop Now</a>
                <a href="#/products?cat=gift" class="btn btn-outline"><i class="fas fa-gift"></i> Gift Boxes</a>
            </div>
        </div>
    </section>`;
}

function renderCategories(active = 'all') {
    return `
    <section class="categories">
        <div class="section-header">
            <span class="leaf-divider"><i class="fas fa-leaf"></i></span>
            <h2>Shop by Category</h2>
            <p>Find the perfect treat for every occasion</p>
        </div>
        <div class="cat-grid">
            ${DB.categories.map(c => `
                <div class="cat-card ${c.id === active ? 'active' : ''}" onclick="navigate('/products?cat=${c.id}')">
                    <span class="cat-icon">${c.icon}</span>
                    <h4>${c.name}</h4>
                </div>
            `).join('')}
        </div>
    </section>`;
}

function updateCartCount() {
    const el = document.getElementById('cartCount');
    if (el) el.textContent = DB.cartCount();
}
