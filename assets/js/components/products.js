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
                <div class="prod-card" onclick="openProductDetail(${p.id})" style="cursor:pointer">
                    ${p.badge ? `<span class="badge badge-${p.badge}">${p.badge === 'sale' ? 'Sale' : p.badge === 'new' ? 'New' : 'Popular'}</span>` : ''}
                    <div class="prod-img">${isUrl ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">` : p.image}</div>
                    <div class="prod-info">
                        <div class="prod-category">${DB.categories.find(c => c.id === p.category)?.name || p.category}</div>
                        <div class="prod-name">${p.name}</div>
                        <div class="prod-rating">${'★'.repeat(Math.floor(p.rating))}${p.rating % 1 >= 0.5 ? '½' : ''} <span>(${p.reviews})</span></div>
                        <div class="prod-price-row">
                            <div class="prod-price">${DB.formatPrice(p.price)}${p.oldPrice ? `<span class="old-price">${DB.formatPrice(p.oldPrice)}</span>` : ''}</div>
                            <button class="add-cart-btn" onclick="event.stopPropagation(); quickBuy(${p.id})" title="Order Now"><i class="fas fa-bolt"></i></button>
                        </div>
                    </div>
                </div>`;
            }).join('') : `<div style="grid-column:1/-1;text-align:center;padding:60px 24px"><i class="fas fa-search" style="font-size:3rem;color:var(--border);margin-bottom:16px;display:block"></i><h3>No products found</h3><p style="color:var(--text-light);margin-top:8px">Try a different search or category</p></div>`}
        </div>
    </section>

    <!-- Product Detail Modal (Daraz-style) -->
    <div class="modal-overlay" id="detailModal">
        <div class="modal-content detail-modal">
            <div class="modal-header">
                <h3><i class="fas fa-box"></i> Product Details</h3>
                <button class="modal-close" onclick="closeDetail()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" id="detailBody"></div>
        </div>
    </div>

    <!-- Quick Buy Checkout Modal -->
    <div class="modal-overlay" id="quickBuyModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-bolt"></i> Quick Order</h3>
                <button class="modal-close" onclick="closeQuickBuy()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="qbProductId">
                <div id="quickBuyPreview" style="background:var(--bg);border-radius:var(--radius-sm);padding:20px;margin-bottom:20px;text-align:center;border:1px solid var(--border)"></div>
                <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px">
                    <h4 style="margin-bottom:16px;color:var(--primary-dark);font-size:1.1rem"><i class="fas fa-user"></i> Your Details</h4>
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
                <button class="btn btn-primary btn-block" onclick="submitQuickOrder()" style="padding:16px;font-size:1.1rem;border-radius:12px"><i class="fas fa-check-circle"></i> Confirm Order</button>
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

function openProductDetail(id) {
    const p = DB.getProduct(id);
    if (!p) return;
    const isUrl = p.image && (p.image.startsWith('http') || p.image.startsWith('data:'));
    const cat = DB.categories.find(c => c.id === p.category);
    const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
    document.getElementById('detailBody').innerHTML = `
        <div class="detail-layout">
            <div class="detail-image-section">
                <div class="detail-image">${isUrl ? `<img src="${p.image}" alt="${p.name}">` : `<span style="font-size:6rem">${p.image}</span>`}</div>
                ${p.oldPrice ? `<div class="detail-save-badge">Save ${DB.formatPrice(p.oldPrice - p.price)}</div>` : ''}
            </div>
            <div class="detail-info-section">
                <div class="detail-category">${cat ? cat.name : p.category}</div>
                <h2 class="detail-title">${p.name}</h2>
                <div class="detail-rating">
                    <span class="stars">${stars}</span>
                    <span class="reviews">${p.reviews} reviews</span>
                </div>
                <div class="detail-price-box">
                    <div class="detail-current-price">${DB.formatPrice(p.price)}</div>
                    ${p.oldPrice ? `<div class="detail-old-price">${DB.formatPrice(p.oldPrice)}</div>` : ''}
                    ${p.oldPrice ? `<div class="detail-discount">${Math.round((1 - p.price/p.oldPrice) * 100)}% OFF</div>` : ''}
                </div>
                <div class="detail-divider"></div>
                <div class="detail-section-title"><i class="fas fa-align-left"></i> Description</div>
                <p class="detail-desc">${p.desc}</p>
                <div class="detail-divider"></div>
                <div class="detail-actions">
                    <button class="btn btn-primary btn-block detail-order-btn" onclick="closeDetail(); quickBuy(${p.id})">
                        <i class="fas fa-bolt"></i> Order Now — ${DB.formatPrice(p.price)}
                    </button>
                    <div style="display:flex;gap:8px;margin-top:12px;justify-content:center">
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href.split('#')[0] + '#/products?cat=' + p.category)}&quote=${encodeURIComponent('Check out ' + p.name + ' at Trendy Treat!')}" target="_blank" class="btn btn-sm btn-outline" style="font-size:.85rem"><i class="fab fa-facebook"></i> Share</a>
                        <a href="https://wa.me/?text=${encodeURIComponent(p.name + ' - ' + DB.formatPrice(p.price) + ' ' + window.location.href.split('#')[0])}" target="_blank" class="btn btn-sm btn-outline" style="font-size:.85rem"><i class="fab fa-whatsapp"></i> Share</a>
                    </div>
                </div>
                <div class="detail-safe">
                    <i class="fas fa-shield-alt"></i> Safe & secure checkout. Your information is protected.
                </div>
            </div>
        </div>
    `;
    document.getElementById('detailModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDetail() {
    document.getElementById('detailModal').classList.remove('open');
    document.body.style.overflow = '';
}

function quickBuy(id) {
    const p = DB.getProduct(id);
    if (!p) return;
    const isUrl = p.image && (p.image.startsWith('http') || p.image.startsWith('data:'));
    document.getElementById('qbProductId').value = id;
    document.getElementById('quickBuyPreview').innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;text-align:left">
            ${isUrl ? `<img src="${p.image}" style="width:70px;height:70px;border-radius:10px;object-fit:cover;flex-shrink:0">` : `<span style="font-size:3rem">${p.image}</span>`}
            <div>
                <div style="font-weight:600;font-size:1rem;color:var(--text)">${p.name}</div>
                <div style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-top:4px">${DB.formatPrice(p.price)}</div>
                <div style="font-size:.85rem;color:var(--text-light)">Qty: 1</div>
            </div>
        </div>
    `;
    document.getElementById('qbName').value = '';
    document.getElementById('qbPhone').value = '';
    document.getElementById('qbAddress').value = '';
    document.getElementById('quickBuyModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('qbName').focus(), 300);
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