// models/bookingModel.ts
import { Sequelize, DataTypes, Model } from 'sequelize';
import { BookingStatus } from '../enums/bookingStatus';
import { Credit } from './creditModel';
import { BookingStatusHistory } from './bookingStatusHistory';

class Booking extends Model {
    public id!: number; 
    public time!: Date;
    public patient!: string;
    public provider!: string;
    public status!: string;
    public CreditId!: number;

    public async setCredit(credit: Credit, options?: any): Promise<void> {
        this.CreditId = credit.id;
        await this.save(options);
    }
}

const defineBookingModel = (sequelize: Sequelize) => {

  Booking.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      time: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toISOString(),
        },
      },
      patient: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: BookingStatus.PENDING,
      },
    },
    {
      sequelize,
      modelName: 'Booking',
    }
  );
  Booking.belongsTo(Credit);
  Booking.hasMany(BookingStatusHistory);
  return Booking;
};

export { defineBookingModel,Booking };
