import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const listenPort = process.env.SERVER_PORT || (() => { throw new Error("SERVER_PORT not defined"); })();
app.listen(listenPort, () => {
    console.log(`Server is running on port ${listenPort}`);
});