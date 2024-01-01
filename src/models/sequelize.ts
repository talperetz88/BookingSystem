// sequelize.ts
import { Sequelize } from 'sequelize';
import { defineCreditModel } from './creditModel';
import { defineBookingModel } from './bookingModel';
import { defineBookingStatusHistoryModel } from './bookingStatusHistory';

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST!,
    dialect: process.env.DB_DIALECT as 'mysql',
    logging: false,
  });

  sequelize.authenticate().catch((error) => {
    console.error('Unable to connect to the database:', error);
    throw error;
});

const Credit = defineCreditModel(sequelize);
const Booking = defineBookingModel(sequelize);
const BookingStatusHistory = defineBookingStatusHistoryModel(sequelize);

export { sequelize, Credit, Booking, BookingStatusHistory };


