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
    // 1 — validate doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // 2 — find or create Patient doc for this user
    let patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      patient = await Patient.create({ userId: req.user._id });
    }

    // 3 — check for duplicate booking (matching schema paths)
    const duplicate = await Appointment.findOne({
      doctorId: doctorId,
      patientId: patient._id,
      appointmentDate: new Date(date),
      timeSlot: time,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (duplicate) {
      return res.status(400).json({
        message: 'You already have an appointment with this doctor at this time',
      });
    }

    // 4 — create appointment using exact Schema keys
    const appointment = await Appointment.create({
      doctorId: doctorId,
      patientId: patient._id,
      appointmentDate: new Date(date),
      timeSlot: time,
      notes: reason,       // Maps frontend 'reason' to backend 'notes'
      fees: doctor.fees,  // Your Doctor model uses 'fees' with an s
    });

    // 5 — return populated appointment using correct schema paths
    const populated = await Appointment.findById(appointment._id)
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } });

  //   const doctorWithUser = await Doctor.findById(doctorId).populate({
  //     path: 'userId',
  //     select: 'name email'
  //   });

  //  if(appointment){
  //    if (!doctorWithUser?.userId?.email) {
  //     throw new Error('Doctor email not found');
  //   }

  //   await sendEmail({
  //     to: doctorWithUser.userId.email,
  //     subject: 'New Appointment Request Pending Approval',
  //     html: `
  //       <h2>Hello Dr. ${doctorWithUser.userId.name},</h2>

  //       <p>You have received a new appointment request that is currently <strong>pending</strong>.</p>

  //       <h3>Appointment Details</h3>
  //       <ul>
  //         <li><strong>Date:</strong> ${date}</li>
  //         <li><strong>Time:</strong> ${time}</li>
  //         <li><strong>Reason:</strong> ${reason || 'Not provided'}</li>
  //       </ul>

  //       <p>Please login to your dashboard to accept or reject this appointment.</p>

  //       <br/>
  //       <p>Regards,<br/>Hospital Management System</p>
  //    `
  //   });
  //  }

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