import mongoose from "mongoose";

const slotSchema = mongoose.Schema({
    day:{
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    }
});

const doctorSchema = mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'departments'
    },
    specialization: { 
        type: String, 
        required: true
    },
    experience: {
        type: String
    },
    fees: {
        type: Number,
        default: 0
    },
    availableSlots: [slotSchema]
},{
    timestamps: true
});

module.export = mongoose.model("Doctor" = doctorSchema);