// Import necessary packages
const express = require('express'); /*A lightweight framework for building web servers in Node.js. It helps handle routes, requests, and responses easily.*/
const mongoose = require('mongoose'); /* A library that allows interaction with MongoDB databases using JavaScript. It provides schemas and models for structured data.*/
const bodyParser = require('body-parser'); /*Middleware to parse incoming JSON data in HTTP requests. It converts request bodies into usable JavaScript objects. */
const cors = require('cors'); /* Middleware that allows your server to accept requests from other origins  */

// Initialize the app
const app = express(); /*Creates an instance of an Express application. This is your main server object where you define routes and middleware. */

// Middleware setup
/* */
app.use(bodyParser.json()); /* Ensures the server can process incoming JSON data from requests.*/
app.use(cors()); /*  Allows cross-origin requests, which are necessary when your frontend and backend run on different domains or ports.*/

// MongoDB Connection
/*Establishes a connection to your MongoDB database.*/
const uri = 'mongodb+srv://marcusmichealdb:dNCPOMwSIaJakqhU@cluster.mongodb.net/jailManagement?retryWrites=true&w=majority'; 
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }) /* Options to use MongoDB's newer connection engine, improving performance and stability.*/
    .then(() => console.log('MongoDB connected')) /*Executes the success callback when the connection is successful. */
    .catch(err => console.log('Database connection error:', err)); /* Handles errors during the connection*/

// Define the schema and model
const inmateSchema = new mongoose.Schema({
    /* Properties of your data, Each field has rules, like required: true, which ensures the field must be present.*/
    name: { type: String, required: true },
    crime: { type: String, required: true },
    sentenceDuration: { type: Number, required: true },
    arrestDate: { type: Date, required: true },
});

const Inmate = mongoose.model('Inmate', inmateSchema);

// Routes
// Get all inmates

app.get('/inmates', async (req, res) => {       /*Defines a route for GET requests to /inmates.*/
    try {
        const inmates = await Inmate.find();  /*Fetches all records from the Inmate collection. */
        res.json(inmates);   /*Sends the fetched records back to the client as JSON.*/
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new inmate
app.post('/inmates', async (req, res) => {
    try {
        const newInmate = new Inmate(req.body);
        await newInmate.save();
        res.json(newInmate);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an inmate
app.put('/inmates/:id', async (req, res) => {
    try {
        const updatedInmate = await Inmate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedInmate);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an inmate
app.delete('/inmates/:id', async (req, res) => {
    try {
        await Inmate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Inmate deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const PORT = 5000; /* Starts the server and listens for requests on the specified port. */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



