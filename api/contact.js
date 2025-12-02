export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body;

    // REPLACE THIS WITH YOUR WEBHOOK URL
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1445422093247447173/FY_qODUm3LDH_UyqHbVsRZ5a_JXTOsrxR9RmVZV7xCmy0ETFFUuS5YxDv-5F18rUG6xl";

    // Determine Color based on Subject
    let color = 16766720; // Default Gold
    if (subject === "Ban Appeal") color = 15158332; // Red
    if (subject === "Bug Report") color = 3447003;  // Blue
    if (subject === "Donation Issue") color = 3066993; // Green

    const payload = {
        username: "Eight RP Support Bot",
        avatar_url: "https://i.ibb.co/3m8R27Q/1764065611411.png",
        embeds: [
            {
                title: `📩 New Ticket: ${subject}`, // Subject in Title
                description: `A new support request has been submitted via the website.`,
                color: color,
                fields: [
                    { name: "👤 User", value: `\`${name}\``, inline: true },
                    { name: "📧 Email", value: `\`${email}\``, inline: true },
                    { name: "📝 Subject", value: `**${subject}**`, inline: false }, // Explicit Subject Field
                    { name: "💬 Message", value: `>>> ${message}`, inline: false }
                ],
                footer: { text: "Eight RP | Contact Form System" },
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
