function renderProducts(category = 'all', search = '', sort = 'popular') {
    let prods = [...DB.products];
    if (category && category !== 'all') prods = prods.filter(p => p.category === category);
    if (search) {
        const q = search.toLowerCase();
        prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (sort === 'price-low') prods.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') prods.sort((a, b) => b.price - a.price);
    else if (sort === 'name') prods.sort((a, b) => a.name.localeCompare(b.name));
    else prods.sort((a, b) => b.rating - a.rating);
    return `
    <section class="products-section">
        <div class="section-header">
            <span class="leaf-divider"><i class="fas fa-leaf"></i></span>
            <h2>${category === 'all' ? 'All Products' : DB.categories.find(c => c.id === category)?.name || 'Products'}</h2>
            <p>${prods.length} item${prods.length !== 1 ? 's' : ''} found</p>
        </div>
        <div class="products-toolbar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" placeholder="Search products..." value="${search}" oninput="handleSearch(this.value)">
            </div>
            <div class="filter-sort">
                <select onchange="navigate('/products?cat=${category}&sort=' + this.value)">
                    <option value="popular" ${sort === 'popular' ? 'selected' : ''}>Most Popular</option>
                    <option value="price-low" ${sort === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
                    <option value="price-high" ${sort === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
                    <option value="name" ${sort === 'name' ? 'selected' : ''}>Name: A-Z</option>
                </select>
            </div>
        </div>
        <div class="prod-grid">
            ${prods.length ? prods.map(p => {
                const isUrl = p.image && (p.image.startsWith('http') || p.image.startsWith('data:'));
                return `
                <div class="prod-card">
                    ${p.badge ? `<span class="badge badge-${p.badge}">${p.badge === 'sale' ? 'Sale' : p.badge === 'new' ? 'New' : 'Popular'}</span>` : ''}
                    <div class="prod-img">${isUrl ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover">` : p.image}</div>
                    <div class="prod-info">
                        <div class="prod-category">${DB.categories.find(c => c.id === p.category)?.name || p.category}</div>
                        <div class="prod-name">${p.name}</div>
                        <div class="prod-rating">${'★'.repeat(Math.floor(p.rating))}${p.rating % 1 >= 0.5 ? '½' : ''} <span>(${p.reviews})</span></div>
                        <div class="prod-price-row">
                            <div class="prod-price">$${p.price.toFixed(2)}${p.oldPrice ? `<span class="old-price">$${p.oldPrice.toFixed(2)}</span>` : ''}</div>
                            <button class="btn btn-sm btn-accent" onclick="event.stopPropagation(); quickBuy(${p.id})" title="Order Now"><i class="fas fa-bolt"></i> Order Now</button>
                        </div>
                    </div>
                </div>`;
            }).join('') : `<div style="grid-column:1/-1;text-align:center;padding:60px 24px"><i class="fas fa-search" style="font-size:3rem;color:var(--border);margin-bottom:16px;display:block"></i><h3>No products found</h3><p style="color:var(--text-light);margin-top:8px">Try a different search or category</p></div>`}
        </div>
    </section>
    <!-- Quick Buy Checkout Modal -->
    <div class="modal-overlay" id="quickBuyModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-bolt"></i> Quick Order</h3>
                <button class="modal-close" onclick="closeQuickBuy()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="qbProductId">
                <div id="quickBuyPreview" style="background:var(--bg);border-radius:var(--radius-sm);padding:16px;margin-bottom:16px;text-align:center"></div>
                <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px">
                    <h4 style="margin-bottom:12px;color:var(--primary-dark)"><i class="fas fa-user"></i> Your Details</h4>
                    <div class="form-group"><label>Full Name *</label><input type="text" id="qbName" placeholder="Your full name" required style="width:100%"></div>
                    <div class="form-group"><label>Phone Number *</label><input type="tel" id="qbPhone" placeholder="+880 1XXXXXXXXXX" required style="width:100%"></div>
                    <div class="form-group"><label>Delivery Address *</label><textarea id="qbAddress" rows="3" placeholder="House, Road, Area, City, ZIP" required style="width:100%"></textarea></div>
                    <div class="form-group"><label>Payment Method</label>
                        <div class="payment-methods">
                            <div class="payment-method active" onclick="selectQuickPayment(this)"><i class="fas fa-mobile-alt"></i><span>bKash/Nagad</span></div>
                            <div class="payment-method" onclick="selectQuickPayment(this)"><i class="fas fa-credit-card"></i><span>Card</span></div>
                            <div class="payment-method" onclick="selectQuickPayment(this)"><i class="fas fa-money-bill-wave"></i><span>Cash</span></div>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary btn-block" onclick="submitQuickOrder()" style="padding:16px;font-size:1.1rem"><i class="fas fa-check-circle"></i> Confirm Order</button>
                <button class="btn btn-outline btn-block" style="margin-top:8px" onclick="closeQuickBuy()">Cancel</button>
            </div>
        </div>
    </div>`;
}

let quickBuyPayment = 'bKash/Nagad';

function selectQuickPayment(el) {
    el.parentElement.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
    quickBuyPayment = el.querySelector('span').textContent;
}

function quickBuy(id) {
    const p = DB.getProduct(id);
    if (!p) return;
    document.getElementById('qbProductId').value = id;
    document.getElementById('quickBuyPreview').innerHTML = `
        <div style="font-size:3rem;margin-bottom:8px">${p.image}</div>
        <h4 style="margin-bottom:4px">${p.name}</h4>
        <p style="color:var(--text-light);font-size:.9rem">$${p.price.toFixed(2)}</p>
    `;
    document.getElementById('qbName').value = '';
    document.getElementById('qbPhone').value = '';
    document.getElementById('qbAddress').value = '';
    document.getElementById('quickBuyModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('qbName').focus();
}

function closeQuickBuy() {
    document.getElementById('quickBuyModal').classList.remove('open');
    document.body.style.overflow = '';
}

function submitQuickOrder() {
    const id = parseInt(document.getElementById('qbProductId').value);
    const name = document.getElementById('qbName').value.trim();
    const phone = document.getElementById('qbPhone').value.trim();
    const address = document.getElementById('qbAddress').value.trim();
    if (!name || !phone || !address) { Toast.show('Please fill in all required fields', 'error'); return; }
    if (phone.replace(/[\+\-\s]/g, '').length < 10) { Toast.show('Please enter a valid phone number', 'error'); return; }
    const p = DB.getProduct(id);
    if (!p) return;
    const customer = { name, email: '', phone, address, payment: quickBuyPayment };
    const order = DB.createQuickOrder(p, customer);
    closeQuickBuy();
    Toast.show('🎉 Order placed! ID: ' + order.id);
    navigate('/orders');
}

function handleSearch(val) {
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => {
        const params = getParams();
        navigate('/products?cat=' + (params.cat || 'all') + '&search=' + encodeURIComponent(val) + '&sort=' + (params.sort || 'popular'));
    }, 400);
}
function addToCart(id) {
    if (DB.addToCart(id)) { updateCartCount(); Toast.show(DB.getProduct(id).name + ' added to cart!'); }
    else Toast.show('Could not add to cart', 'error');
}