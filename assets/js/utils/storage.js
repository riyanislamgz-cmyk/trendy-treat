const Store = {
    get(k, def = null) { try { const d = localStorage.getItem('tt_' + k); return d ? JSON.parse(d) : def } catch { return def } },
    set(k, v) { try { localStorage.setItem('tt_' + k, JSON.stringify(v)); return true } catch { return false } },
    del(k) { localStorage.removeItem('tt_' + k) }
};
const Toast = {
    show(msg, type = 'success') {
        const c = document.getElementById('toastContainer');
        const t = document.createElement('div');
        t.className = 'toast ' + type;
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-circle' };
        t.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i> ' + msg;
        c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(120px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300) }, 3000);
    }
};
