const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const app = express();
const port = 3000;

const announcementsFile = './data/announcements.json';
const usersFile = './data/users.json';

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Read user data
const users = fs.readJsonSync(usersFile);

// Authentication route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username] === password) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Get announcements
app.get('/announcements', (req, res) => {
    const announcements = fs.readJsonSync(announcementsFile, { throws: false }) || [];
    res.json(announcements);
});

// Save announcements
app.post('/announcements', (req, res) => {
    fs.writeJsonSync(announcementsFile, req.body);
    res.json({ success: true });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
