const https = require('https');
const fs = require('fs');

const express = require('express');
const cors = require('cors');
const srsRouter = require('./routes/steamreviewsextractor');
const openaiRoutes = require('./routes/openai');

const options = {
    key: fs.readFileSync('./certs/private.key'),
    cert: fs.readFileSync('./certs/www_hprnv_pro_2024_02_04.crt'),
    ca: [
        fs.readFileSync('./certs/root_pem_globalsign_ssl_dv_free_1.crt'),
        fs.readFileSync('./certs/your-root-certificate.pem')
    ]
};

const app = express();
const PORT = 3000;

// Setting CORS to allow chat.openapi.com is required for ChatGPT to access your plugin
app.use(cors({ origin: [`http://localhost:${PORT}`, 'https://chat.openai.com'] }));
app.use(express.json());

// Simple request logging to see if your plugin is being called by ChatGPT
app.use((req, res, next) => {
    console.log(`Request received: ${req.method}: ${req.path}`)
    next()
})

// OpenAI Required Routes
app.use(openaiRoutes);

// The dummy steamreviewrsextractor API
app.use('/reviews', srsRouter);

https.createServer(options, app).listen(PORT, () => {
    console.log(`Plugin server listening on port ${PORT}`)
});

/*
app.listen(PORT, () => {
    console.log(`Plugin server listening on port ${PORT}`);
});
*/