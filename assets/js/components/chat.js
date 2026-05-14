let chatHistory = [];
function initChat() {
    const toggle = document.getElementById('chatToggle');
    const window = document.getElementById('chatWindow');
    const close = document.getElementById('chatClose');
    const send = document.getElementById('chatSend');
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    if (!toggle || !window) return;
    toggle.onclick = () => window.classList.toggle('open');
    close.onclick = () => window.classList.remove('open');
    send.onclick = () => sendChatMessage();
    input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } };
    input.oninput = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 80) + 'px'; };
}
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = ''; input.style.height = 'auto';
    addChatMessage(msg, 'user');
    chatHistory.push({ role: 'user', content: msg });
    const typingId = showTyping();
    let reply;
    if (Gemini.init()) {
        const result = await Gemini.chat(msg, chatHistory);
        reply = result.text;
    } else {
        reply = handleLocalChat(msg);
    }
    removeTyping(typingId);
    addChatMessage(reply, 'bot');
    chatHistory.push({ role: 'assistant', content: reply });
}
function addChatMessage(text, role) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
        <div class="avatar"><i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i></div>
        <div><div class="msg-content">${text.replace(/\n/g, '<br>')}</div><div class="msg-time">${time}</div></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
function showTyping() {
    const messages = document.getElementById('chatMessages');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = id;
    div.innerHTML = `<div class="avatar"><i class="fas fa-robot"></i></div><div class="msg-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return id;
}
function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
function handleLocalChat(msg) {
    const q = msg.toLowerCase();
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) return 'Hello! Welcome to Trendy Treat 🌿 How can I help you today?';
    if (q.includes('product') || q.includes('shop') || q.includes('buy') || q.includes('gift')) {
        const prods = DB.products.slice(0, 3);
        return `Here are some of our popular items:\n${prods.map(p => `• ${p.image} **${p.name}** - ${DB.formatPrice(p.price)}`).join('\n')}\n\nBrowse all products in the Shop section! 🎁`;
    }
    if (q.includes('order') || q.includes('delivery') || q.includes('ship')) {
        return 'You can view all your orders in the Orders section. If you need help with a specific order, please provide the order ID! 📦';
    }
    if (q.includes('contact') || q.includes('support') || q.includes('email')) {
        return 'You can reach us at support@trendytreat.com or call +1 (555) 123-4567. We\'re here to help! 💚';
    }
    if (q.includes('price') || q.includes('cost') || q.includes('cheap')) {
        const cheapest = [...DB.products].sort((a, b) => a.price - b.price)[0];
        return `Our prices start at ${DB.formatPrice(cheapest.price)} for ${cheapest.name}. We have options for every budget! 🎯`;
    }
    return `Hi! I'm Trendy AI 🌿 I can help you with:\n• Product recommendations 🎁\n• Order status 📦\n• Store information ℹ️\n• Gift ideas 💝\n\nWhat would you like to know?`;
}
