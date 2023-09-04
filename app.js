const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// store mappings b/w short and long URLs
const urlMapping = {};
let shortUrlCounter = 1;

//middleware to parse JSON req
app.use(bodyParser.json());

//endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
    const longUrl = req.body.long_url;

    if(!longUrl) {
        return res.status(400).json({ error: "Missing 'long_url' parameter"});
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
app.get('/:shortUrl', (req, res) => {
    const shortUrl = parseInt(req.params.shortUrl);

    if(!isNaN(shortUrl) && urlMapping.hasOwnProperty(shortUrl)) {
        const longUrl = urlMapping[shortUrl];
        res.redirect(longUrl);
    } else {
        res.status(404).json({error: 'Short URL not found'});
    }
});

app.listen(port, () => {
    console.log(`URL shortening service is running on port ${port}`);
});