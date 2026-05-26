import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js'

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth/v1', authRouter);

app.get('/', (req, res) => {
  res.send('Hello, Yoga Server!');
});

export default app