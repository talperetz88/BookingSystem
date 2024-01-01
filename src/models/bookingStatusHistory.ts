import { Sequelize, DataTypes, Model } from 'sequelize';
import { Booking } from './bookingModel';

class BookingStatusHistory extends Model {
  public id!: number; 
  public status!: string;
  public timestamp!: Date;
}

const defineBookingStatusHistoryModel = (sequelize: Sequelize) => {
  BookingStatusHistory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'BookingStatusHistory',
    }
  );
  BookingStatusHistory.belongsTo(Booking);
  return BookingStatusHistory;
};

export { defineBookingStatusHistoryModel,BookingStatusHistory };
