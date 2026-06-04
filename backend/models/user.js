import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema =  mongoose.Schema({
    name :{
        type: String,
        required: true
    },
    email: {
        type: email,
        required: true
    },
    password: {
        type: password,
        required: true
    },
    role: {
        type: String,
        enum: ['patient, doctor, admin'],
       required: true
    },
    specialization: {
        type: String,
        required: function(){
            return this.role === 'doctor';
        }
    },
    profileImage: {
        type: String,
        defualt: ''
    }
},{
    timestamps: true
})

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model("User", userSchema);