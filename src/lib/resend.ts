export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "noreply@everbond.ai";

  if (!apiKey) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}\n${html}`);
    return { id: "dev-email" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to, subject, html })
  });

  if (!response.ok) throw new Error(`Resend failed: ${response.status} ${await response.text()}`);
  return response.json();
}
