const express = require('express');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const mongoose = require('mongoose');
require(dotenv).config();

const dbUrl = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER_URL}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
const app = express();
const port = 3000;

db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

// store mappings b/w short and long URLs
const urlMapping = {};
let shortUrlCounter = 1;

//middleware to parse JSON req
app.use(bodyParser.json());

function isValidUrl(url) {
    return validUrl.isUri(url);
}

//endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
    console.log('Received POST request to /api/shorturl');
    const longUrl = req.body.long_url;

    if(!longUrl || !isValidUrl(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL format'});
    }

    //generate short URL
    const shortUrl = shortUrlCounter;
    shortUrlCounter++;

    //store the mapping
    urlMapping[shortUrl] = longUrl;

    //return Json res
    const response = {
        original_url: longUrl,
        short_url: shortUrl,
    };

    res.json(response);
});

//redirect to original URL using short URL
app.get('/api/shorturl/:shortUrl', async (req, res) => {

    try {
        console.log(`Received GET request to /api/shorturl/${req.params.shortUrl}`);
        const shortUrl = parseInt(req.params.shortUrl);
    
        if (!isNaN(shortUrl)) {
            const mapping = await UrlMapping.findOne({ shortUrl });
        
            if (mapping) {
              console.log(`Redirecting to: ${mapping.longUrl}`);
              res.redirect(mapping.longUrl);
            } else {
              console.error('Error: Short URL not found');
              res.status(404).json({ error: 'Short URL not found' });
            }
          } else {
            console.error('Error: Invalid short URL format');
            res.status(400).json({ error: 'Invalid short URL format' });
          }
    //     if(!isNaN(shortUrl) && urlMapping.hasOwnProperty(shortUrl)) {
    //         const longUrl = urlMapping[shortUrl];
    //         res.redirect(longUrl);
    //     } else {
    //         res.status(404).json({error: 'Short URL not found'});
    //     }
      } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
      }

});

app.listen(port, () => {
    console.log(`URL shortening service is running on port ${port}`);
});