const express = require('express');
const app = express();
const port = 3000;

const resultRouter = require('./routers/result');

app.use(express.json());
app.get('/', (_, res) => res.send('jentestore`s Node.js test'));
app.get('/result', resultRouter);

module.exports = app.listen(port, () => {
    console.log(`jentestore_test Server is starting on ${port}`);
});