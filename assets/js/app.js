function getParams() {
    const hash = location.hash.slice(1) || '/';
    const parts = hash.split('?');
    const path = parts[0];
    const params = {};
    if (parts[1]) {
        parts[1].split('&').forEach(p => {
            const [k, v] = p.split('=');
            params[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
    }
    return { path, ...params };
}
function navigate(hash) {
    location.hash = hash;
    render();
}
function render() {
    const main = document.getElementById('mainContent');
    if (!main) return;
    const { path, cat, search, sort } = getParams();
    let html = '';
    switch (path) {
        case '/':
        case '':
            html = renderHero() + renderCategories(cat || 'all') + renderProducts(cat || 'all', search || '', sort || 'popular');
            break;
        case '/products':
            html = renderProducts(cat || 'all', search || '', sort || 'popular');
            break;
        case '/cart':
            html = renderCart();
            break;
        case '/checkout':
            html = renderCheckout();
            break;
        case '/orders':
            html = renderOrders();
            break;
        case '/admin':
            html = renderAdmin();
            break;
        case '/supplier':
            html = renderSupplier();
            break;
        default:
            html = `<div style="text-align:center;padding:80px 24px"><h2>404 - Page Not Found</h2><p style="color:var(--text-light);margin:16px 0"><a href="#/" class="btn btn-primary">Go Home</a></div>`;
    }
    main.innerHTML = html;
    updateCartCount();
    initChat();
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === '#/' + path || (path === '/' && href === '#/'));
    });
}
document.addEventListener('DOMContentLoaded', () => {
    render();
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.onclick = () => { hamburger.classList.toggle('active'); navLinks.classList.toggle('open'); };
    }
    window.addEventListener('hashchange', render);
});
