import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helloWorldRouter from './src/routers/helloworld.router.js';

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api', helloWorldRouter);

app.get('/', (req, res) => {
  res.send('Hello, Yoga Server!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});