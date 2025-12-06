import mysql from 'mysql2/promise';

// --- CONFIGURATION ---
const USE_MOCK_DATA = true; // Set to FALSE when you connect a real DB

// --- MOCK DATA STORE (Used if USE_MOCK_DATA is true) ---
let mockPlayers = [
    { uid: 1, username: "Star_Founder", cash: 999999999, level: 100, adminlevel: 10, locked: 0 },
    { uid: 2, username: "Dev_Admin", cash: 500000, level: 50, adminlevel: 11, locked: 0 },
    { uid: 3, username: "Officer_John", cash: 15000, level: 12, adminlevel: 0, locked: 0 },
    { uid: 4, username: "Gangster_Mike", cash: 2500, level: 5, adminlevel: 0, locked: 0 },
    { uid: 5, username: "Trouble_Maker", cash: 0, level: 2, adminlevel: 0, locked: 1 }, // Banned
    { uid: 6, username: "Newbie_Player", cash: 500, level: 1, adminlevel: 0, locked: 0 }
];

// --- REAL DB CONNECTION ---
const db = mysql.createPool({
    host: 'YOUR_NEW_HOST_IP',
    user: 'YOUR_NEW_USERNAME',
    password: 'YOUR_NEW_PASSWORD',
    database: 'YOUR_NEW_DB_NAME',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});

export default async function handler(req, res) {
    
    // ============================================
    // MOCK MODE LOGIC
    // ============================================
    if (USE_MOCK_DATA) {
        if (req.method === 'GET') {
            return res.status(200).json(mockPlayers);
        } 
        else if (req.method === 'POST') {
            const { uid, username, cash, level, adminlevel, status } = req.body;
            const index = mockPlayers.findIndex(p => p.uid == uid);
            
            if (index > -1) {
                // Handle Updates
                if (status) mockPlayers[index].locked = (status === 'Banned' ? 1 : 0);
                if (adminlevel !== undefined) mockPlayers[index].adminlevel = parseInt(adminlevel);
                if (username) {
                    mockPlayers[index].username = username;
                    mockPlayers[index].cash = parseInt(cash);
                    mockPlayers[index].level = parseInt(level);
                    mockPlayers[index].adminlevel = parseInt(adminlevel);
                }
                return res.status(200).json({ message: 'Mock Data Updated' });
            }
            return res.status(404).json({ error: 'User not found' });
        }
    }

    // ============================================
    // REAL DATABASE LOGIC
    // ============================================
    
    // --- GET ---
    if (req.method === 'GET') {
        try {
            const sql = `SELECT uid, username, cash, level, adminlevel, locked FROM users ORDER BY adminlevel DESC, uid DESC LIMIT 100`;
            const [rows] = await db.query(sql);
            res.status(200).json(rows);
        } catch (error) {
            console.error("DB Error:", error);
            res.status(500).json({ error: 'Database Connection Failed' });
        }
    } 
    
    // --- POST ---
    else if (req.method === 'POST') {
        const { uid, username, cash, level, adminlevel, status } = req.body;
        try {
            if (status !== undefined && !username) {
                const lockValue = status === 'Banned' ? 1 : 0;
                await db.query('UPDATE users SET locked = ? WHERE uid = ?', [lockValue, uid]);
                res.status(200).json({ message: 'Status updated' });
            }
            else if (adminlevel !== undefined && !username) {
                await db.query('UPDATE users SET adminlevel = ? WHERE uid = ?', [adminlevel, uid]);
                res.status(200).json({ message: 'Admin level updated' });
            }
            else {
                await db.query(
                    'UPDATE users SET username = ?, cash = ?, level = ?, adminlevel = ? WHERE uid = ?',
                    [username, cash, level, adminlevel, uid]
                );
                res.status(200).json({ message: 'User updated' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
