import mongoose from "mongoose";

const DoctorRequestSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true },
    address: { 
        type: String, 
        required: true 
    },
    specialization: { 
        type: String, 
        required: true 
    },
    emailStatus: {
        type: String,
        enum: ['pending', 'email_verified', 'email_not_verified'],
        default: 'pending',
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'registeration_approved', 'registeration_rejected', 'account_created'],
        default: 'pending',
    },
    emailVerifyToken: { type: String },
    emailVerifyExpires: { type: Date },
    setupToken:        { type: String },
    setupTokenExpires: { type: Date },
}, 
{ 
    timestamps: true 
});

const DoctorRequest = mongoose.model("DoctorRequest", DoctorRequestSchema);
export default DoctorRequest;