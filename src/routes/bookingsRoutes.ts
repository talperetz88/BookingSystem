import express, { Request, Response } from 'express';
import { createBooking, getBookings, getBookingHistory } from '../controllers/bookingsController';


const router = express.Router();

router.post('/createBookings', createBooking);
router.get('/getBookings', getBookings);
router.get('/getBookingHistory/:bookingId/history', getBookingHistory);

export default router;
