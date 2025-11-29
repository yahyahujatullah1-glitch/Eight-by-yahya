import mysql from 'mysql2/promise';

// --- DATABASE CONNECTION ---
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
    
    // --- GET: FETCH USERS ---
    if (req.method === 'GET') {
        try {
            // Select only necessary columns for performance
            const sql = `
                SELECT uid, username, cash, level, adminlevel, locked, vippackage, hours 
                FROM users 
                ORDER BY adminlevel DESC, uid DESC 
                LIMIT 100
            `;
            const [rows] = await db.query(sql);
            res.status(200).json(rows);
        } catch (error) {
            console.error("DB Error:", error);
            res.status(500).json({ error: 'Database Connection Failed' });
        }
    } 
    
    // --- POST: UPDATE USERS ---
    else if (req.method === 'POST') {
        const { uid, username, cash, level, adminlevel, status } = req.body;
        
        try {
            // 1. Toggle Ban (Locked status)
            if (status !== undefined && !username) {
                const lockValue = status === 'Banned' ? 1 : 0;
                await db.query('UPDATE users SET locked = ? WHERE uid = ?', [lockValue, uid]);
                res.status(200).json({ message: 'Status updated' });
            }
            // 2. Promote/Demote Admin
            else if (adminlevel !== undefined && !username) {
                await db.query('UPDATE users SET adminlevel = ? WHERE uid = ?', [adminlevel, uid]);
                res.status(200).json({ message: 'Admin level updated' });
            }
            // 3. Full Edit
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
