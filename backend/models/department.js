import mongoose from 'mongoose';

const departmentSchema = mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
},
  description:   { 
    type: String 
},
  headDoctorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Doctor' 
},
}, { timestamps: true });

module.export = mongoose.model('Department', departmentSchema);