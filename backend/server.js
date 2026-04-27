import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());




const BREVO_API_KEY=process.env.BREVO_API_KEY;


app.post("/send-email", async (req, res) => {
    try {
        const { email, name } = req.body;

        console.log("📩 Incoming Email Request:", req.body);

        if (!email) {
            console.log("❌ No email provided");
            return res.status(400).send("Email is required");
        }

        console.log("🚀 Sending email via Brevo...");

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: "PURPOS",
                    email: "teampurpos@gmail.com"
                },
                to: [
                    {
                        email: email,
                        name: name || "Volunteer"
                    }
                ],
                subject: `${req.body.name}, you have a new match`,
                htmlContent: `
<div style="font-family: Arial, sans-serif; padding: 16px; color: #333;">

    <p>Hi ${req.body.name},</p>

    <p>
        We found a volunteering match based on your preferences.
    </p>

    <div style="background:#f5f5f5; padding:12px; border-radius:8px; margin:12px 0;">
        <p style="margin:0;"><strong>NGO:</strong> ${req.body.ngoName}</p>
        <p style="margin:0;"><strong>Opportunity:</strong> ${req.body.title}</p>
    </div>

    <p>
        You can log in to your dashboard to view more details and take action.
    </p>

    <p style="margin-top:20px;">
        Regards,<br>
        <strong>Purpos</strong>
    </p>

</div>
`
            })
        });

        const data = await response.json();

        console.log("📧 Brevo API Response:", data);

        if (!response.ok) {
            console.log("❌ Brevo Error:", data);
            return res.status(500).json(data);
        }

        res.json(data);

    } catch (error) {
        console.error("💥 SERVER ERROR:", error);
        res.status(500).send("Email failed");
    }
});



const PORT = process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})