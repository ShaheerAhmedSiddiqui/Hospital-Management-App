import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phoneNumber: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'others'],
    },
    address: {
        type: String
    },
    medicalHistory: [{ type: String }],
},{
    timestamps: true
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;