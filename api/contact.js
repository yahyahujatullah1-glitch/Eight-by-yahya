// File: api/contact.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body;

    // REPLACE THIS WITH YOUR REAL DISCORD WEBHOOK URL
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1445422093247447173/FY_qODUm3LDH_UyqHbVsRZ5a_JXTOsrxR9RmVZV7xCmy0ETFFUuS5YxDv-5F18rUG6xl";

    // Create the Discord Embed
    const payload = {
        username: "Eight RP Website Bot",
        embeds: [
            {
                title: `📩 New Support Ticket: ${subject}`,
                color: 16766720, // Gold Color
                fields: [
                    { name: "User", value: name, inline: true },
                    { name: "Email", value: email, inline: true },
                    { name: "Message", value: message }
                ],
                footer: { text: "Sent from Website Contact Form" },
                timestamp: new Date().toISOString()
            }
        ]
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send to Discord' });
    }
}
