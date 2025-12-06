export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body;

    // YOUR WEBHOOK URL
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1445422093247447173/FY_qODUm3LDH_UyqHbVsRZ5a_JXTOsrxR9RmVZV7xCmy0ETFFUuS5YxDv-5F18rUG6xl";

    // Color Logic
    let color = 16766720; // Gold
    if (subject === "Ban Appeal") color = 15158332; // Red
    if (subject === "Bug Report") color = 3447003;  // Blue
    if (subject === "Donation Issue") color = 3066993; // Green

    const payload = {
        
        embeds: [
            {
                title: `📩 New Ticket: ${subject}`,
                color: color,
                fields: [
                    { name: "👤 User", value: name, inline: true },
                    { name: "📧 Email", value: email, inline: true },
                    { name: "📝 Subject", value: subject, inline: true }, // Inline to save space
                    { name: "💬 Message", value: message } // No blockquote, just raw text for clarity
                ],
                footer: { 
                    text: "Star City RP Contact System", 
                    icon_url: "https://i.ibb.co/3m8R27Q/1764065611411.png" 
                },
                timestamp: new Date().toISOString()
            }
        ]
    };

    try {
        const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!discordRes.ok) {
            throw new Error(`Discord API Error: ${discordRes.statusText}`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send to Discord' });
    }
}
