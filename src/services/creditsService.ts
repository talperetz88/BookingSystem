import { Sequelize } from "sequelize";
import { Booking } from "../models/bookingModel";
import { Credit } from "../models/creditModel";
import { BookingStatus } from "../enums/bookingStatus";

interface ICreditService{
    getCredit(patientId:string): Promise<[Credit[],any]>
}

export class CreditService implements ICreditService{
    private sequelize: Sequelize;

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;
    }

    async getCredit(patientId:string): Promise<[Credit[],any]>{
        // get credits for the specified patient
        const credits = await Credit.findAll({
            where: {
            patient: patientId,
            },
        });
        // Retrieve the monthly credits used statistics from the database for the specified patient
        const stats = await this.getCreditsUsedStats(patientId);

        return [credits, stats]
    }

    // Function to get monthly statistics on credits used by a specific patient, including the percentage
    async getCreditsUsedStats(patientId:string) {
    try {
      // Retrieve total credits available for the specified patient
      const totalCreditsQuery = await Credit.sum('type', {
        where: {
          BookingId: null, // Credits not associated with any booking
        },
      });
  
      // Retrieve monthly credits used by the specified patient
      const stats = await Booking.findAll({
        attributes: [
          [this.sequelize.fn('SUM', this.sequelize.literal(`CASE WHEN "Booking"."status" = "${BookingStatus.CONFIRMED}" THEN "Credit"."type" END`)), 'totalCreditsUsed'],
          [this.sequelize.fn('MONTH', this.sequelize.col('"Booking"."time"')), 'month'],
          [this.sequelize.fn('YEAR', this.sequelize.col('"Booking"."time"')), 'year'],
        ],
        include: [
          {
            model: Credit,
            attributes: [],
            where: {
              BookingId: this.sequelize.literal('"Booking"."id"'), // Match Credit to Booking
            },
          },
        ],
        where: {
          patient: patientId,
          status: BookingStatus.CONFIRMED,
        },
        group: ['month', 'year'],
      });
  
      // Extract the results from the stats
      const result = stats.map((row) => ({
        totalCreditsUsed: row.getDataValue('totalCreditsUsed') || 0,
        month: row.getDataValue('month'),
        year: row.getDataValue('year'),
      }));
  
      // Calculate the percentage for each month
      const totalCreditsAvailable = totalCreditsQuery || 1; // To avoid division by zero
      const monthlyStatsWithPercentage = result.map((row) => ({
        ...row,
        percentageCreditsUsed: (row.totalCreditsUsed / totalCreditsAvailable) * 100,
      }));
  
      return monthlyStatsWithPercentage;
    } catch (error) {
      console.error('Error getting monthly credits used statistics:', error);
      throw error;
    }
  }
}