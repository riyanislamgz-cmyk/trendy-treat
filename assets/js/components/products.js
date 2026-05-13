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
                            <button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})" title="Add to cart"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>`;
            }).join('') : `<div style="grid-column:1/-1;text-align:center;padding:60px 24px"><i class="fas fa-search" style="font-size:3rem;color:var(--border);margin-bottom:16px;display:block"></i><h3>No products found</h3><p style="color:var(--text-light);margin-top:8px">Try a different search or category</p></div>`}
        </div>
    </section>`;
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
