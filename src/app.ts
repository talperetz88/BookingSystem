import express from 'express';
import { Sequelize } from 'sequelize';
import bookingsRoutes from './routes/bookingsRoutes';
import creditsRoutes from './routes/creditsRoutes';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;
app.use(bodyParser.json());

app.use('/api', bookingsRoutes);
app.use('/api', creditsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
