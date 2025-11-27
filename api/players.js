import mysql from 'mysql2/promise';

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
    
    // --- GET: FETCH USERS & ADMINS ---
    if (req.method === 'GET') {
        try {
            // Added 'hours' and 'vippackage' to the select list
            const sql = `
                SELECT 
                    uid, username, cash, level, adminlevel, 
                    discordtag, locked, hours, vippackage
                FROM users 
                ORDER BY adminlevel DESC, uid DESC 
                LIMIT 200
            `;
            const [rows] = await db.query(sql);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ error: 'DB Connection Failed' });
        }
    } 
    
    // --- POST: UPDATE / PROMOTE / BAN ---
    else if (req.method === 'POST') {
        const { uid, username, cash, level, adminlevel, status } = req.body;
        
        // CASE 1: Toggle Ban (Status)
        if (status !== undefined && !username) {
            try {
                const lockValue = status === 'Banned' ? 1 : 0;
                await db.query('UPDATE users SET locked = ? WHERE uid = ?', [lockValue, uid]);
                res.status(200).json({ message: 'Status updated' });
            } catch (error) { res.status(500).json({ error: error.message }); }
        }
        
        // CASE 2: Update Admin Level Only (Promote/Demote/Fire)
        else if (adminlevel !== undefined && !username) {
            try {
                await db.query('UPDATE users SET adminlevel = ? WHERE uid = ?', [adminlevel, uid]);
                res.status(200).json({ message: 'Admin rank updated' });
            } catch (error) { res.status(500).json({ error: error.message }); }
        }

        // CASE 3: Full Edit (Modal Save)
        else {
            try {
                await db.query(
                    'UPDATE users SET username = ?, cash = ?, level = ?, adminlevel = ? WHERE uid = ?',
                    [username, cash, level, adminlevel, uid]
                );
                res.status(200).json({ message: 'Data saved' });
            } catch (error) { res.status(500).json({ error: error.message }); }
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
        }
