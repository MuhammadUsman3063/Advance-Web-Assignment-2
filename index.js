const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000; 

// ==========================================
// 1. BUILT-IN MIDDLEWARES (Ma'am's Requirement)
// ==========================================
// Form data ko parse karne ke liye 
app.use(express.urlencoded({ extended: true }));

// NAYA MIDDLEWARE: Public folder ko static files ke liye use karna
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 2. CUSTOM LOGGING MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
    const logMessage = `Method: ${req.method}, Route: ${req.url}\n`;
    console.log(`[LOG] ${logMessage.trim()}`);
    
    fs.appendFile(path.join(__dirname, 'log.txt'), logMessage, (err) => {
        if (err) console.error("Log error:", err);
    });
    next(); 
});

// ==========================================
// 3. ROUTES (Static & Dynamic)
// ==========================================
app.get('/', (req, res) => res.send('Welcome to the Express Server!'));
app.get('/about', (req, res) => res.send('This is the About page.'));
app.get('/contact', (req, res) => res.send('Contact us at contact@domain.com'));

app.get('/greet', (req, res) => {
    const userName = req.query.name;
    if (userName) res.send(`Hello, ${userName}!`);
    else res.send('Hello, Stranger!');
});

// ==========================================
// 4. FORM HANDLING (POST Route)
// ==========================================
// NOTE: GET '/form' route ab yahan se remove kar diya gaya hai kyunke 
// express.static ab khud public/form.html ko serve karega.

app.post('/submit', (req, res) => {
    const userName = req.body.name;
    const userEmail = req.body.email;
    res.send(`Form submitted! Name: ${userName}, Email: ${userEmail}`);
});

// ==========================================
// 5. ERROR HANDLING MIDDLEWARES
// ==========================================
app.use((req, res) => {
    res.status(404).json({ error: "Route not found. Please check the URL." });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong on the server!" });
});

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Server is perfectly running on http://localhost:${PORT}`);
});