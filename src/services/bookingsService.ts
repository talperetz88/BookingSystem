import { Sequelize,Op } from "sequelize";
import { Credit } from "../models/creditModel";
import { Booking } from "../models/bookingModel";
import { BookingStatusHistory } from "../models/bookingStatusHistory";
import { BookingStatus } from "../enums/bookingStatus";
interface IBookingService {
    createBooking(time: Date, patient: string | null, provider: string): Promise<Booking>;
    getBookingAndStats(userId:string):Promise<[any,any]>
    getBookingStatusHistory(bookingId:string):Promise<BookingStatusHistory[]>
  }
  
export class BookingService implements IBookingService {
    private sequelize: Sequelize;

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;
    }

    async createBooking(time: Date, patient: string | null, provider: string): Promise<Booking> {
        const t = await this.sequelize.transaction();

        try {
        // Find an unused credit that is not expired
        const d = new Date().toISOString();
        const credit = await Credit.findOne({
            where: {
            expirationDate: {
                [Op.gt]: d, // Expiration date is greater than the current date
            },
            BookingId: null, // Credit is not associated with any booking
            },
            transaction: t,
        });

        if (!credit) {
            await t.rollback();
            throw new Error('No unused, non-expired credits found.');
        }

        // Create a booking associated with the credit
        const booking = await Booking.create({ time, patient, provider }, { transaction: t });

        // Record the initial status in the booking status history
        await BookingStatusHistory.create({ status: BookingStatus.PENDING, BookingId: booking.id }, { transaction: t });

        // Associate the booking with the credit
        await booking.setCredit(credit, { transaction: t });

        await t.commit();

        // Return a tuple with the created Booking instance and the associated Credit instance
        return booking;
        } catch (error) {
        await t.rollback();
        throw error;
        }

    }

    async getBookingAndStats(userId:any):Promise<[any,any]>{
        // Retrieve bookings from the database for the specified user
        const bookings = await Booking.findAll({
            where: {
            [Op.or]: [{ patient: userId }, { provider: userId }],
            },
        });
    
        let stats = [];
        if (bookings?.[0].provider === userId) stats = await this.getStats(userId);

        return [bookings,stats]
    }
    async getBookingStatusHistory(bookingId:string):Promise<BookingStatusHistory[]>{

         // Retrieve the booking status history from the database for the specified booking
        const history = await BookingStatusHistory.findAll({
            where: { BookingId: bookingId },
            order: [['timestamp', 'ASC']], // Order by timestamp in ascending order
        });
        return history;
    }
    async getStats(providerId: any) {
        try {
          // Retrieve canceled and rescheduled bookings for the specified provider
          const stats = await Booking.findAll({
            attributes: [
              [this.sequelize.fn('COUNT', this.sequelize.literal(`DISTINCT CASE WHEN status = "${BookingStatus.CANCELED}" THEN id END`)), 'canceledBookings'],
              [this.sequelize.fn('COUNT', this.sequelize.literal(`DISTINCT CASE WHEN status = "${BookingStatus.RESCHEDULED}" THEN id END`)), 'rescheduledBookings'],
            ],
            where: {
              provider: providerId,
              [Op.or]: [{ status: BookingStatus.CANCELED }, { status: BookingStatus.RESCHEDULED}],
            },
          });
      
          // Extract the results from the stats
          const [result] = stats;
      
          // Prepare the statistic information
          const canceledBookings = result.getDataValue('canceledBookings') || 0;
          const rescheduledBookings = result.getDataValue('rescheduledBookings') || 0;
      
          return [
            canceledBookings,
            rescheduledBookings,
          ];
        } catch (error) {
          console.error('Error getting cancellation and reschedule statistics:', error);
          throw error;
        }
      }
}