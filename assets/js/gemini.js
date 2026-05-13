const Gemini = {
    key: '',
    model: 'gemini-2.0-flash',
    init() {
        const s = DB.getSettings();
        this.key = s.geminiKey || '';
        return this.key ? true : false;
    },
    setKey(k) {
        this.key = k;
        const s = DB.getSettings();
        s.geminiKey = k;
        DB.saveSettings(s);
    },
    async chat(message, history = []) {
        if (!this.key) return { text: '⚠️ Gemini API key is not set. Please go to Admin > Settings and add your Gemini API key.', error: true };
        try {
            const parts = history.map(m => ({ text: m.role === 'user' ? m.content : m.content }));
            parts.push({ text: message });

            const systemPrompt = `You are Trendy AI, the helpful assistant for Trendy Treat - an e-commerce store. 

Current store data:
- Products: ${JSON.stringify(DB.products.map(p => ({ id: p.id, name: p.name, price: '$' + p.price.toFixed(2), category: p.category })))}
- Total products: ${DB.products.length}
- Categories: ${DB.categories.map(c => c.name).join(', ')}

You can help with:
1. Product recommendations & suggestions
2. Order inquiries (user can provide order ID)
3. Store information & policies
4. General questions about products
5. Gift ideas and suggestions

Keep responses friendly, concise, and helpful. Use emojis occasionally. If asked about orders, ask for the order ID. If asked about products not in the list, suggest similar available products. Be natural and conversational. Never make up product details - only use the provided product data.`;

            const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + this.model + ':generateContent?key=' + this.key, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: systemPrompt + '\n\nUser: ' + message }]
                    }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 500, topP: 0.9 }
                })
            });

            if (!res.ok) {
                const err = await res.text();
                if (res.status === 403 || res.status === 400) {
                    return { text: '⚠️ Invalid API key or API not enabled. Please check your Gemini API key in Admin Settings.', error: true };
                }
                return { text: '⚠️ API Error: ' + (err.slice(0, 100) || 'Unknown error'), error: true };
            }

            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that.';
            return { text, error: false };
        } catch (e) {
            return { text: '⚠️ Connection error: ' + e.message, error: true };
        }
    },
    async smartSearch(query) {
        if (!this.key || !query.trim()) return DB.products;
        try {
            const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + this.model + ':generateContent?key=' + this.key, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'Given these products: ' + JSON.stringify(DB.products.map(p => p.name + ' (' + p.category + ') - $' + p.price + ' - ' + p.desc)) + '\n\nReturn only the product IDs (comma-separated) that match the search: "' + query + '". Return empty string if no match. Only return IDs, nothing else.' }]
                    }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 100 }
                })
            });
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const ids = text.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            return ids.length ? DB.products.filter(p => ids.includes(p.id)) : DB.products;
        } catch { return DB.products; }
    },
    async handleOrder(userMessage, orders) {
        if (!this.key) return null;
        const context = orders.map(o => `Order ${o.id}: ${o.status}, items: ${o.items.length}, total: $${o.total.toFixed(2)}, date: ${new Date(o.date).toLocaleDateString()}`).join('\n');
        try {
            const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + this.model + ':generateContent?key=' + this.key, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'Customer orders:\n' + context + '\n\nCustomer message: ' + userMessage + '\n\nIf the customer is asking about their order, reply helpfully based on the order data. If asking for status, tell them the status and any notes. Be friendly and professional. If you cannot help, say so.' }]
                    }],
                    generationConfig: { temperature: 0.5, maxOutputTokens: 300 }
                })
            });
            const data = await res.json();
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch { return null; }
    },
    async optimizePrompt(task) {
        if (!this.key) return '';
        try {
            const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + this.model + ':generateContent?key=' + this.key, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'Given this admin task: "' + task + '", provide a brief 2-3 sentence suggestion on how to improve the store or handle this. Focus on e-commerce best practices.' }]
                    }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
                })
            });
            const data = await res.json();
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch { return ''; }
    }
};
