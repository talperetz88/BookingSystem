// models/creditModel.ts
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Booking } from './bookingModel';

class Credit extends Model {
    public id!: number;
    public type!: string;
    public expirationDate!: Date;
  }
  
const defineCreditModel = (sequelize: Sequelize) => {
  Credit.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toISOString(),
        },
      },
    },
    {
      sequelize,
      modelName: 'Credit',
    }
  );
  Credit.hasOne(Booking)
  return Credit;
};

export { defineCreditModel,Credit };
