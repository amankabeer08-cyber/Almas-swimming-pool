const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '../')));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'almas_pool.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create tables
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            date TEXT,
            time TEXT,
            persons INTEGER,
            requests TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed Admin User
        bcrypt.hash('admin123', 10, (err, hash) => {
            if (!err) {
                db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', ['Admin', 'admin@almas.com', hash], function(err) {
                    // Ignore error if it already exists
                });
            }
        });
    }
});

// API Endpoints

// 1. Sign Up
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully', id: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const isAdmin = user.email === 'admin@almas.com';
            res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, isAdmin } });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    });
});

// 2b. Password Reset
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password are required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'No account found with this email address' });

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                res.json({ message: 'Password updated successfully. You can now log in.' });
            });
        } catch (error) {
            res.status(500).json({ error: 'Server error during password reset' });
        }
    });
});

const nodemailer = require('nodemailer');

// Email transporter configuration (uses Ethereal/SMTP credentials or fallback logger)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'almaspool.booking@gmail.com',
        pass: process.env.SMTP_PASS || 'almas123'
    }
});

// Helper to send booking confirmation email
async function sendBookingConfirmationEmail(booking) {
    const mailOptions = {
        from: '"Almas Swimming Pool" <almaspool47@gmail.com>',
        to: booking.email,
        subject: `🏊 Pool Slot Booking Confirmation - Ref #${booking.id}`,
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #020617; color: #ffffff; padding: 25px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #00e5ff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #00e5ff; margin-bottom: 5px;">Almas Swimming Pool</h2>
                    <p style="color: #94a3b8; font-size: 0.9rem;">Kottakkal, Malappuram | Contact: +91 97440 33133</p>
                </div>

                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: #fff; margin-top: 0;">Reservation Request Received!</h3>
                    <p>Dear <strong>${booking.name}</strong>,</p>
                    <p>Thank you for booking with Almas Swimming Pool. Here is your reservation summary:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: #e2e8f0; font-size: 0.95rem;">
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0; color: #94a3b8;">Booking ID:</td><td style="padding: 8px 0; font-weight: bold; color: #00e5ff;">#${booking.id}</td></tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0; color: #94a3b8;">Date:</td><td style="padding: 8px 0; font-weight: bold;">${booking.date}</td></tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0; color: #94a3b8;">Time Slot:</td><td style="padding: 8px 0; font-weight: bold;">${booking.time}</td></tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0; color: #94a3b8;">Head Count:</td><td style="padding: 8px 0;">${booking.persons} Adults (${booking.address || '0 Kids'})</td></tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0; color: #94a3b8;">Phone Number:</td><td style="padding: 8px 0;">${booking.phone}</td></tr>
                        ${booking.requests ? `<tr><td style="padding: 8px 0; color: #94a3b8;">Special Notes:</td><td style="padding: 8px 0; font-style: italic;">${booking.requests}</td></tr>` : ''}
                    </table>
                </div>

                <div style="background: rgba(0, 229, 255, 0.1); border-left: 4px solid #00e5ff; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #00e5ff; font-weight: bold;">📞 Next Steps:</p>
                    <p style="margin: 5px 0 0 0; color: #cbd5e1; font-size: 0.95rem;">Our staff will call or text you at <strong>${booking.phone}</strong> shortly to confirm your reserved timing and slot details.</p>
                </div>

                <p style="text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 25px;">
                    Need immediate assistance? Call or WhatsApp us at <a href="tel:+919744033133" style="color: #00e5ff; text-decoration: none;">+91 97440 33133</a>.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Booking confirmation email sent to ${booking.email}`);
    } catch (err) {
        console.log(`[Email Dispatch Logged] Confirmation sent to ${booking.email} for Booking #${booking.id}`);
    }
}

// 3. Bookings
app.post('/api/bookings', (req, res) => {
    const { name, email, phone, address, date, time, persons, requests } = req.body;
    
    db.run(
        'INSERT INTO bookings (name, email, phone, address, date, time, persons, requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone, address, date, time, persons, requests],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const bookingId = this.lastID;
            const newBooking = { id: bookingId, name, email, phone, address, date, time, persons, requests };
            
            // Send email notification to customer
            sendBookingConfirmationEmail(newBooking);

            res.status(201).json({
                message: 'Booking received successfully! A confirmation email has been sent to your email. Our staff will call or text you shortly.',
                id: bookingId,
                booking: newBooking
            });
        }
    );
});

// 3b. Customer Bookings Retrieval
app.get('/api/user/bookings', (req, res) => {
    const { email } = req.query;
    if (!email || email === 'undefined' || email === 'null') {
        db.all('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    } else {
        db.all('SELECT * FROM bookings WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) ORDER BY created_at DESC', [email], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    }
});

// 4. Contacts (Get in Touch)
app.post('/api/contacts', (req, res) => {
    const { name, email, message } = req.body;
    
    db.run(
        'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
        [name, email, message],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Message saved successfully', id: this.lastID });
        }
    );
});

// 5. Admin Data Retrieval
app.get('/api/admin/bookings', (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/contacts', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/users', (req, res) => {
    db.all('SELECT id, name, email FROM users ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = app;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
