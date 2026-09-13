// Supabase Direct Fetch Client
window.createSupabaseClient = function(url, key) {
    return {
        from: function(table) {
            return {
                select: function(cols = '*') {
                    return {
                        eq: function(col, val) {
                            return {
                                maybeSingle: async () => {
                                    const res = await fetch(`${url}/rest/v1/${table}?${col}=eq.${val}&select=${cols}`, {
                                        headers: { "apikey": key, "Authorization": `Bearer ${key}` }
                                    });
                                    const data = await res.json();
                                    return { data: data[0] || null, error: null };
                                }
                            }
                        }
                    }
                },
                insert: async function(records) {
                    const res = await fetch(`${url}/rest/v1/${table}`, {
                        method: 'POST',
                        headers: {
                            "apikey": key,
                            "Authorization": `Bearer ${key}`,
                            "Content-Type": "application/json",
                            "Prefer": "return=representation"
                        },
                        body: JSON.stringify(records)
                    });
                    const data = await res.json();
                    if (!res.ok) return { data: null, error: { message: data.message || "Error" } };
                    return { data, error: null };
                }
            };
        }
    };
};
