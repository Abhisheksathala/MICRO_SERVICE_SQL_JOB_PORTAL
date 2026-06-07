import express from 'express';
import 'dotenv/config';
import type {Request, Response,Express} from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import AuthRouter from './routes/auth.js';
import { connectKafkaProducer } from './producer.js';



const app:Express = express();

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  compression({
    threshold: 1024,
  }),
);
app.use(helmet());

connectKafkaProducer()

app.get('/', (req:Request, res:Response) => {
    res.send('Auth service');
});

app.use('/api/auth', AuthRouter);




export default app;