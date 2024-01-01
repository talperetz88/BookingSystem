import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BookingService } from '../services/bookingsService';
import {sequelize} from '../models/sequelize';

const bookingService = new BookingService(sequelize);

export const createBooking = () => asyncHandler(async (req: Request, res: Response) => {
        const { time, patient, provider } = req.body;

        try {
            const booking = await bookingService.createBooking(time, patient, provider);
        res.status(201).json({
            message: 'Booking created successfully',
            booking: booking.toJSON(),
        });
        } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'An error occurred while creating the booking.' });
        }
    })
//   res.status(200).json({ message: 'Booking created successfully' });

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ error: 'User ID must be provided as a query parameter.' });
    }
  
    try {
      const [bookings,stats] = await bookingService.getBookingAndStats(userId)
  
      res.status(200).json({ bookings, stats });
    } catch (error) {
      console.error('Error retrieving bookings:', error);
      res.status(500).json({ error: 'An error occurred while retrieving bookings.' });
    }
});

export const getBookingHistory = asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    try {
       const history = await bookingService.getBookingStatusHistory(bookingId);
      res.status(200).json({ history });
    } catch (error) {
      console.error('Error retrieving booking status history:', error);
      res.status(500).json({ error: 'An error occurred while retrieving booking status history.' });
    }
});
