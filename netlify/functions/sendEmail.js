import nodemailer from 'nodemailer';

export async function handler(event) {
    // Add CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        console.log('Received request body:', event.body);

        const { to, subject, body, attachments } = JSON.parse(event.body);

        // Validate required fields
        if (!to || !subject || !body) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: to, subject, or body' })
            };
        }

        // for testing
        const testRecipient = 'salshaiban@alkhorayef.com';

        console.log('Creating transporter...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENDEREMAIL,
                pass: process.env.SENDERPASSWORD,
            },
        });

        console.log('Sending email to:', testRecipient);
        // Send email
        await transporter.sendMail({
            from: process.env.SENDEREMAIL,
            to: testRecipient,
            subject,
            html: body,

            attachments: attachments?.map(att => ({
                filename: att.filename,
                content: att.content, // base64 string or Buffer
                contentType: att.contentType,
                encoding: 'base64'
            }))

        });

        console.log('Email sent successfully');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Email sent successfully'
            })
        };
    } catch (error) {
        console.error('Error in sendEmail function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Failed to send email',
                details: error.toString()
            })
        };
    }
}