// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const app = express();
app.use(bodyParser.json());

// SETUP: Use your OAuth2 credentials here
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'YOUR_REDIRECT_URI';
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

app.post('/send-outreach', async (req, res) => {
  const { creatorEmail, brandName, brandEmail, productName, campaignGoals, budget, timeline, specialNotes } = req.body;

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const emailContent = `
To: ${creatorEmail}
Subject: Collaboration Opportunity from ${brandName}

Dear Creator,

We are reaching out from **${brandName}** regarding a potential collaboration opportunity.

Here are the details:
- **Brand Email:** ${brandEmail}
- **Product/Service:** ${productName}
- **Campaign Goals:** ${campaignGoals}
- **Budget:** ${budget}
- **Timeline:** ${timeline || 'Not specified'}
- **Special Notes:** ${specialNotes || 'None'}

We would love to connect with you to discuss how we can work together.

Please let us know your availability.

Best regards,  
${brandName} Team
`;

  const encodedMessage = Buffer.from(
    `From: ${brandEmail}\r\n` +
    `To: ${creatorEmail}\r\n` +
    'Content-Type: text/plain; charset=utf-8\r\n' +
    'Subject: Collaboration Opportunity\r\n\r\n' +
    emailContent
  )
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    res.status(200).send({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Failed to send email.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
