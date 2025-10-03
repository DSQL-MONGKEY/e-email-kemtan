import { Resend } from "resend";


const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendOrderEmail({ to, orderId, qrDataUrl }: { to: string; orderId: string; qrDataUrl: string; }) {
   const from = process.env.EMAIL_FROM || "DSCVRY <noreply@example.com>";
   const html = `
      <div style="font-family:Arial,sans-serif">
      <h2>Thank you, your order has successfully created</h2>
      <p>Order ID: <b>${orderId}</b></p>
      <p>Show this QR in Kiosk App for take your order</p>
      <img src="${qrDataUrl}" alt="QR" style="width:200px;height:200px"/>
      </div>`;
   
   await resend.emails.send({ from, to, subject: `DSCVRY · Order ${orderId}`, html });
}