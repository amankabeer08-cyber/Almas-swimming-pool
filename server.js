const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
// Serve static files from the current directory
app.use(express.static(__dirname));

// Initialize SQLite database
const db = new sqlite3.Database('./almas_pool.db', (err) => {
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

// 3. Bookings
app.post('/api/bookings', (req, res) => {
    const { name, email, phone, address, date, time, persons, requests } = req.body;
    
    db.run(
        'INSERT INTO bookings (name, email, phone, address, date, time, persons, requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone, address, date, time, persons, requests],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Booking received successfully', id: this.lastID });
        }
    );
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
