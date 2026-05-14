const DB = {
    categories: [
        { id: 'all', name: 'All Items', icon: '🎁' },
        { id: 'chocolate', name: 'Chocolates', icon: '🍫' },
        { id: 'cake', name: 'Cakes', icon: '🎂' },
        { id: 'cookie', name: 'Cookies', icon: '🍪' },
        { id: 'gift', name: 'Gift Boxes', icon: '🎀' },
        { id: 'flower', name: 'Flowers', icon: '💐' }
    ],
    products: [
        { id: 1, name: 'Premium Chocolate Box', category: 'chocolate', supplierPrice: '', price: 25, oldPrice: 35, rating: 4.8, reviews: 124, image: '🍫', badge: 'sale', desc: 'Handcrafted premium Belgian chocolates in an elegant gift box. 24 pieces of pure bliss.', supplier: '' },
        { id: 2, name: 'Rose Bouquet Deluxe', category: 'flower', supplierPrice: '', price: 40, oldPrice: null, rating: 4.9, reviews: 89, image: '💐', badge: 'popular', desc: '24 long-stemmed premium roses arranged beautifully with eucalyptus and baby breath.' , supplier: "" },
        { id: 3, name: 'Artisan Cookie Collection', category: 'cookie', supplierPrice: '', price: 20, oldPrice: 25, rating: 4.7, reviews: 156, image: '🍪', badge: 'sale', desc: 'Assorted artisan cookies - chocolate chip, oatmeal raisin, and double fudge.' , supplier: "" },
        { id: 4, name: 'Celebration Cake', category: 'cake', supplierPrice: '', price: 35, oldPrice: null, rating: 4.6, reviews: 67, image: '🎂', badge: 'new', desc: 'Custom-designed celebration cake with fresh cream, fruits, and edible decorations.' , supplier: "" },
        { id: 5, name: 'Luxury Hamper Gift Set', category: 'gift', supplierPrice: '', price: 70, oldPrice: 85, rating: 4.9, reviews: 203, image: '🎀', badge: 'popular', desc: 'Ultimate gift hamper with chocolates, wine, gourmet snacks, and premium treats.' , supplier: "" },
        { id: 6, name: 'Dark Chocolate Truffles', category: 'chocolate', supplierPrice: '', price: 15, oldPrice: null, rating: 4.5, reviews: 98, image: '🍫', badge: null, desc: 'Rich dark chocolate truffles with ganache filling. 12 pieces per box.' , supplier: "" },
        { id: 7, name: 'Birthday Surprise Box', category: 'gift', supplierPrice: '', price: 30, oldPrice: null, rating: 4.7, reviews: 45, image: '🎁', badge: 'new', desc: 'Curated birthday surprise box with candles, treats, and personalized message.' , supplier: "" },
        { id: 8, name: 'Mixed Flower Arrangement', category: 'flower', supplierPrice: '', price: 30, oldPrice: 36, rating: 4.6, reviews: 78, image: '💐', badge: 'sale', desc: 'Colorful mixed flower arrangement with seasonal blooms in a decorative vase.' , supplier: "" },
        { id: 9, name: 'Chocolate Fudge Cake', category: 'cake', supplierPrice: '', price: 38, oldPrice: null, rating: 4.8, reviews: 112, image: '🎂', badge: 'popular', desc: 'Decadent 3-layer chocolate fudge cake with Belgian chocolate ganache.' , supplier: "" },
        { id: 10, name: 'Macaron Gift Box', category: 'cookie', supplierPrice: '', price: 22, oldPrice: null, rating: 4.4, reviews: 56, image: '🍪', badge: null, desc: 'French macarons assortment. 18 pieces in 6 flavors. Perfect gift.' , supplier: "" },
        { id: 11, name: 'Truffle Collection Box', category: 'chocolate', supplierPrice: '', price: 28, oldPrice: 38, rating: 4.9, reviews: 167, image: '🍫', badge: 'popular', desc: 'Award-winning truffle collection. 16 hand-rolled truffles in 8 flavors.' , supplier: "" },
        { id: 12, name: 'Mini Cake Trio', category: 'cake', supplierPrice: '', price: 25, oldPrice: null, rating: 4.5, reviews: 34, image: '🎂', badge: 'new', desc: 'Three mini cakes - red velvet, tiramisu, and mango. Perfect for sharing.' , supplier: "" },
        { id: 13, name: 'Corporate Gift Basket', category: 'gift', supplierPrice: '', price: 75, oldPrice: 92, rating: 4.7, reviews: 89, image: '🎀', badge: 'sale', desc: 'Premium corporate gift basket with wine, chocolates, dried fruits, and nuts.' , supplier: "" },
        { id: 14, name: 'Sunflower Bouquet', category: 'flower', supplierPrice: '', price: 25, oldPrice: null, rating: 4.3, reviews: 45, image: '💐', badge: null, desc: 'Bright sunflower bouquet that brings sunshine to any room. 12 stems.' , supplier: "" },
        { id: 15, name: 'Cookie Dough Gift Jar', category: 'cookie', supplierPrice: '', price: 16, oldPrice: null, rating: 4.6, reviews: 73, image: '🍪', badge: null, desc: 'Edible cookie dough in a mason jar. Premium ingredients, just scoop and enjoy.' , supplier: "" },
    ]
};
DB.getProduct = (id) => DB.products.find(p => p.id === id);
DB.getRetailPrice = (p) => p.supplierPrice ? Math.round(p.supplierPrice * 1.1) : p.price;
DB.setSupplierPrice = (pid, sp) => { const p = DB.getProduct(pid); if (!p) return; p.supplierPrice = sp; p.price = Math.round(sp * 1.1); };
DB.getCart = () => Store.get('cart', []);
DB.saveCart = (c) => Store.set('cart', c);
DB.getOrders = () => Store.get('orders', []);
DB.saveOrders = (o) => Store.set('orders', o);
DB.getInventory = () => Store.get('inventory', {});
DB.saveInventory = (i) => Store.set('inventory', i);
DB.getSuppliers = () => Store.get('suppliers', []);
DB.saveSuppliers = (s) => Store.set('suppliers', s);
DB.getSettings = () => Store.get('settings', { geminiKey: 'AIzaSyBLWPd5Sx6ID4KtO1UKLtXlAhD-8awo-QU', storeName: 'Trendy Treat', currency: 'BDT' });
DB.currencySymbol = () => { const s = DB.getSettings(); return s.currency === 'BDT' ? '৳' : '$'; };
DB.formatPrice = (amount) => { const s = DB.getSettings(); return s.currency === 'BDT' ? '৳' + (amount * 120).toFixed(0) : '$' + amount.toFixed(2); };
DB.parsePrice = (amount) => { const s = DB.getSettings(); return s.currency === 'BDT' ? Math.round(amount / 120) : amount; };
DB.shipping = () => DB.getSettings().currency === 'BDT' ? 99 : 5.99;
DB.freeThreshold = () => DB.getSettings().currency === 'BDT' ? 2000 : 50;
DB.freeThresholdFormatted = () => DB.formatPrice(DB.freeThreshold());
DB.saveSettings = (s) => Store.set('settings', s);
DB.cartCount = () => DB.getCart().reduce((sum, i) => sum + i.qty, 0);
DB.cartTotal = () => DB.getCart().reduce((sum, i) => sum + i.qty * i.price, 0);
DB.addToCart = (pid, qty = 1) => {
    const p = DB.getProduct(pid); if (!p) return false;
    const c = DB.getCart(); const ex = c.find(i => i.id === pid);
    if (ex) ex.qty += qty; else c.push({ id: pid, name: p.name, price: p.price, image: p.image, qty });
    DB.saveCart(c); return true;
};
DB.removeFromCart = (pid) => { DB.saveCart(DB.getCart().filter(i => i.id !== pid)) };
DB.updateQty = (pid, qty) => {
    const c = DB.getCart(); const i = c.find(it => it.id === pid);
    if (i) { if (qty <= 0) DB.removeFromCart(pid); else { i.qty = qty; DB.saveCart(c) } }
};
DB.clearCart = () => Store.set('cart', []);
DB.createOrder = (data) => {
    const o = DB.getOrders();
    const order = {
        id: 'TT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(),
        items: DB.getCart(),
        subtotal: DB.cartTotal(),
        shipping: DB.shipping(),
        total: DB.cartTotal() + DB.shipping(),
        customer: data,
        status: 'pending',
        date: new Date().toISOString(),
        notes: ''
    };
    o.unshift(order); DB.saveOrders(o); DB.clearCart();
    const inv = DB.getInventory();
    order.items.forEach(item => { inv[item.id] = (inv[item.id] || 20) - item.qty });
    DB.saveInventory(inv);
    return order;
};
DB.createQuickOrder = (product, customer) => {
    const o = DB.getOrders();
    const items = [{ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 }];
    const total = product.price + DB.shipping();
    const order = {
        id: 'TT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(),
        items: items,
        subtotal: product.price,
        shipping: DB.shipping(),
        total: total,
        customer: customer,
        status: 'pending',
        date: new Date().toISOString(),
        notes: ''
    };
    o.unshift(order); DB.saveOrders(o);
    const inv = DB.getInventory();
    inv[product.id] = (inv[product.id] || 20) - 1;
    DB.saveInventory(inv);
    return order;
};
DB.updateOrderStatus = (id, status, notes = '') => {
    const o = DB.getOrders(); const ord = o.find(o => o.id === id);
    if (ord) { ord.status = status; if (notes) ord.notes = notes; DB.saveOrders(o); return true }
    return false;
};
DB.getStats = () => {
    const o = DB.getOrders();
    return {
        totalOrders: o.length,
        revenue: o.reduce((sum, ord) => sum + ord.total, 0),
        pending: o.filter(o => o.status === 'pending').length,
        completed: o.filter(o => o.status === 'delivered').length,
        products: DB.products.length,
        totalSold: o.reduce((sum, ord) => sum + ord.items.reduce((s, i) => s + i.qty, 0), 0)
    };
};
