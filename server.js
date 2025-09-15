require('dotenv').config();

const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Google Sheets API setup
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const spreadsheetId = '15QQqvOQtsPJIWB66ptfSGzujraX6Ov3G7CHlANK1nwU'; // <-- PASTE YOUR SPREADSHEET ID HERE

// This function will check if an email already exists in the sheet
async function emailExists(email) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get all values from column B (assuming emails are in column B)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!B:B', 
    });

    const emailsInSheet = response.data.values;
    
    if (emailsInSheet) {
      const emailList = emailsInSheet.flat().map(e => e.toLowerCase());
      const isDuplicate = emailList.includes(email.toLowerCase());
      return isDuplicate;
    }
    
    return false;
  } catch (error) {
    console.error('The API returned an error when checking for duplicates:', error);
    return false;
  }
}

// This function appends a new email to the sheet
async function appendToSheet(email) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    const now = new Date();
    const timestamp = now.toISOString();
    const values = [[timestamp, email]];

    const resource = {
      values,
    };

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:B', 
      valueInputOption: 'RAW',
      resource,
    });
    return response.data.updates.updatedRows > 0;
  } catch (error) {
    console.error('The API returned an error:', error);
    return false;
  }
}

// Basic email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// API endpoint to handle email submissions
app.post('/submit', async (req, res) => {
  const { email } = req.body;

  // Step 1: Validate email format
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format.' });
  }

  // Step 2: Check for duplicate email before appending
  const isDuplicate = await emailExists(email);
  if (isDuplicate) {
    return res.status(409).json({ success: false, message: 'This email is already registered.' });
  }

  // Step 3: If valid and not a duplicate, append the new email
  const saved = await appendToSheet(email);

  if (saved) {
    res.json({ success: true, message: 'Thanks for joining, you’ll be updated soon!' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save email. Please try again later.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});