import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyotp: { type: String, default: '' },
    verifyotpexpiryAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetotp: { type: String, default: '' },
    resetotpExpireAt: { type: Number, default: 0 },
});

// reuse existing model if already registered
const userModel = mongoose.models.User || mongoose.model('User', userSchema);

export default userModel;