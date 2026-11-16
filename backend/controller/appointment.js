import mongoose from 'mongoose';
import Appointment from '../models/appointment.js';
import Patient from '../models/patient.js';
import Doctor from '../models/doctor.js';
import { sendEmail } from '../utils/sendEmail.js'
// ─────────────────────────────────────────────
// POST /api/appointments
// ─────────────────────────────────────────────


export const bookAppointment = async (req, res) => {
  const { doctorId, date, time, reason } = req.body;

  try {
    // 1. Validate doctor ID
    if (
      typeof doctorId !== 'string' ||
      !mongoose.isObjectIdOrHexString(doctorId)
    ) {
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    // 2. Validate date format
    if (
      typeof date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({ message: 'Invalid appointment date' });
    }

    const [year, month, day] = date.split('-').map(Number);

    const validDate = new Date(year, month - 1, day);

    if (
      validDate.getFullYear() !== year ||
      validDate.getMonth() !== month - 1 ||
      validDate.getDate() !== day
    ) {
      return res.status(400).json({ message: 'Invalid calendar date' });
    }

    // 3. Validate time
    if (
      typeof time !== 'string' ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    ) {
      return res.status(400).json({ message: 'Invalid appointment time' });
    }

    // 4. Validate reason
    if (
      typeof reason !== 'string' ||
      reason.length > 500
    ) {
      return res.status(400).json({ message: 'Invalid appointment reason' });
    }

    // 5. Use validated values
    const safeDoctorId = new mongoose.Types.ObjectId(doctorId);
    const safeTime = time;
    const appointmentDate = validDate;

    // 6. Validate doctor exists
    const doctor = await Doctor.findById(safeDoctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // 7. Get day of week
    const dayOfWeek = appointmentDate.toLocaleDateString(
      'en-US',
      { weekday: 'short' }
    );

    // 8. Check doctor's availability
    const isWithinAvailability = doctor.availableSlots?.some(slot => {
      if (slot.day !== dayOfWeek) return false;

      return safeTime >= slot.startTime &&
             safeTime <= slot.endTime;
    });

    if (!isWithinAvailability) {
      return res.status(400).json({
        message: `Doctor is not available at ${safeTime} on ${dayOfWeek}.`
      });
    }

    // 9. Find or create patient
    let patient = await Patient.findOne({
      userId: req.user._id
    });

    if (!patient) {
      patient = await Patient.create({
        userId: req.user._id
      });
    }

    // 10. Prevent duplicate bookings
    const duplicate = await Appointment.findOne({
      doctorId: safeDoctorId,
      patientId: patient._id,
      appointmentDate: appointmentDate,
      timeSlot: safeTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (duplicate) {
      return res.status(400).json({
        message: 'You already have a pending or confirmed appointment at this exact time.'
      });
    }

    // 11. Create appointment
    const appointment = await Appointment.create({
      doctorId: safeDoctorId,
      patientId: patient._id,
      appointmentDate: appointmentDate,
      timeSlot: safeTime,
      notes: reason,
      fees: doctor.fees
    });

    // 12. Populate appointment data
    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    return res.status(201).json({
      message: 'Appointment booked successfully!',
      data: populated
    });

  } catch (err) {
    console.error('Book appointment error:', err);

    return res.status(500).json({
      message: 'Failed to book appointment'
    });
  }
};


// ─────────────────────────────────────────────
// GET /api/appointments
// ─────────────────────────────────────────────
export const getAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.json([]);
      filter.patientId = patient._id; // Updated key
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.json([]);
      filter.doctorId = doctor._id; // Updated key
    }

    const appointments = await Appointment.find(filter)
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email phone' } })
      .sort({ appointmentDate: -1 }); // Updated key

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/appointments/:id
// ─────────────────────────────────────────────
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/appointments/:id/status
// ─────────────────────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/appointments/:id
// ─────────────────────────────────────────────
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      // Updated key check from appointment.patient to appointment.patientId
      if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
      }
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};