// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
//const uri = 'mongodb+srv://marcusmichealdb:dNCPOMwSIaJakqhU@cluster0.fscli.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URI
mongoose.connect("mongodb://localhost:27017/Inmate")
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Schema and Model
const inmateSchema = new mongoose.Schema({
    name: String,
});
const Inmate = mongoose.model('Inmate', inmateSchema);

// Routes
app.get('/Inmate', async (req, res) => {
    try {
        console.log('Fetching inmates...');
        const inmates = await Inmate.find();
        console.log('Inmates:', inmates);
        res.json(inmates);
    } catch (err) {
        console.error('Error fetching inmates:', err.message);
        res.status(500).json({ error: err.message });
    }
});


app.post('/inmates', async (req, res) => {
    try {
        const newInmate = new Inmate(req.body);
        await newInmate.save();
        res.json(newInmate);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




