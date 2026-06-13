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
    // 1 — Validate doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // 2 — convert target date into exact 3-letter day format ("Mon", "Tue")
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'short' }); 

    // 3 — Check if the requested time falls within the doctor's time ranges
    const isWithinAvailability = doctor.availableSlots?.some(slot => {
      if (slot.day !== dayOfWeek) return false;
      
      // Assumes 24-hour time strings (e.g., "09:00" <= "10:30" <= "13:00")
      return time >= slot.startTime && time <= slot.endTime;
    });

    if (!isWithinAvailability) {
      return res.status(400).json({ 
        message: `Doctor is not available at ${time} on ${dayOfWeek}.` 
      });
    }

    // 4 — Find or create Patient document for the authenticated user
    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      patient = await Patient.create({ userId: req.user._id });
    }

    // 5 — Prevent duplicate bookings for the same slot
    const duplicate = await Appointment.findOne({
      doctorId: doctorId,
      patientId: patient._id,
      appointmentDate: new Date(date),
      timeSlot: time,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (duplicate) {
      return res.status(400).json({
        message: 'You already have a pending or confirmed appointment at this exact time.',
      });
    }

    // 6 — Create appointment using exact schema keys (notes, fees)
    const appointment = await Appointment.create({
      doctorId: doctorId,
      patientId: patient._id,
      appointmentDate: new Date(date),
      timeSlot: time,
      notes: reason,      
      fees: doctor.fees, 
    });

    // 7 — Populate data for client consumption
    const populated = await Appointment.findById(appointment._id)
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } });

    // Success response to prevent frontend from hanging
    return res.status(201).json({
      message: 'Appointment booked successfully!',
      data: populated
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
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