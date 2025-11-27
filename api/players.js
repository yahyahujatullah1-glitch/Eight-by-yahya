import mysql from 'mysql2/promise';

// --- YOUR DATABASE CONNECTION ---
const db = mysql.createPool({
    host: '15.235.181.136',
    user: 'u3317843_E1e09UfRDg',
    password: 'X6yD=+Mr3nK232sVNOfv9aNq',
    database: 's3317843_Yahya',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default async function handler(req, res) {
    
    // ==========================================
    // 1. GET REQUEST: Fetch Players (Important Columns Only)
    // ==========================================
    if (req.method === 'GET') {
        try {
            // We only select the important columns for the admin panel
            const sql = `
                SELECT 
                    uid, 
                    username, 
                    cash, 
                    level, 
                    adminlevel, 
                    discordtag, 
                    locked 
                FROM users 
                ORDER BY uid DESC 
                LIMIT 100
            `;
            const [rows] = await db.query(sql);
            res.status(200).json(rows);
        } catch (error) {
            console.error("DB Error:", error);
            res.status(500).json({ error: 'Database connection failed' });
        }
    } 
    
    // ==========================================
    // 2. POST REQUEST: Update Player Data
    // ==========================================
    else if (req.method === 'POST') {
        const { uid, username, cash, level, adminlevel, status } = req.body;
        
        // Scenario A: Ban/Unban (Toggle 'locked')
        if (status !== undefined && !username) {
            try {
                // If status is "Banned", set locked = 1. Else locked = 0
                const lockValue = status === 'Banned' ? 1 : 0;
                await db.query('UPDATE users SET locked = ? WHERE uid = ?', [lockValue, uid]);
                res.status(200).json({ message: 'Player status updated' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } 
        // Scenario B: Full Edit
        else {
            try {
                await db.query(
                    'UPDATE users SET username = ?, cash = ?, level = ?, adminlevel = ? WHERE uid = ?',
                    [username, cash, level, adminlevel, uid]
                );
                res.status(200).json({ message: 'Player data saved' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
