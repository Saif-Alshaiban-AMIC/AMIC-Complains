import nodemailer from 'nodemailer';

export async function handler(event) {
    try {
        const { to, subject, body } = JSON.parse(event.body);

        // for testing
        const testRecipient = 'salshaiban@alkhorayef.com';

     
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.SENDEREMAIL,       
                pass: process.env.SENDERPASSWORD,   
            },
        });

        // Send email
        await transporter.sendMail({
            from: process.env.SENDEREMAIL,
            to:  testRecipient, 
            subject,
            html: body,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
