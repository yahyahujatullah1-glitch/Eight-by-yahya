// --- CONFIGURATION ---
const USE_MOCK_SUPABASE = true; 

// --- MOCK DATA ---
let mockRules = [
    { id: 1, category: 'general', title: 'Respect', content: 'Be nice.' },
    { id: 2, category: 'crimes', title: 'No RDM', content: 'No Random Deathmatch.' }
];

let mockCategories = [
    { id: 1, name: 'General', slug: 'general' },
    { id: 2, name: 'Crimes', slug: 'crimes' }
];

class MockSupabase {
    from(table) {
        return {
            select: () => {
                return {
                    order: () => Promise.resolve({ data: (table === 'rules' ? mockRules : mockCategories) }),
                    then: (cb) => Promise.resolve({ data: (table === 'rules' ? mockRules : mockCategories) })
                };
            },
            insert: (rows) => {
                const row = rows[0];
                if (table === 'categories') mockCategories.push({ ...row, id: Date.now() });
                else mockRules.push({ ...row, id: Date.now() });
                return Promise.resolve({ error: null });
            },
            delete: () => {
                return {
                    eq: (col, val) => {
                        if (table === 'rules') mockRules = mockRules.filter(r => r[col] != val);
                        if (table === 'categories') mockCategories = mockCategories.filter(c => c[col] != val);
                        return Promise.resolve({ error: null });
                    }
                }
            }
        };
    }
}

export const supabase = new MockSupabase();
