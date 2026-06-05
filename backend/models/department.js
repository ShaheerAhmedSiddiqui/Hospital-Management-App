import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
},
  description:   { 
    type: String 
},
  headDoctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor' 
},
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;