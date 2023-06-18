const express = require('express');
const cors = require('cors');
const srsRouter = require('./routes/steamreviewsextractor');
const openaiRoutes = require('./routes/openai');

const app = express();
const PORT = 3000;

// Setting CORS to allow chat.openapi.com is required for ChatGPT to access your plugin
app.use(cors({ origin: [`https://steam-reviews-extractor--justrocket.repl.co`, 'https://chat.openai.com'] }));
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

app.listen(PORT, () => {
    console.log(`Plugin server listening on port ${PORT}`);
});