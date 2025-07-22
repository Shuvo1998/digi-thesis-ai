// digi-thesis-ai/server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['student', 'supervisor', 'admin'], // Define allowed roles
            default: 'student', // Default role for new registrations
        },
        // You might add more fields later, e.g., fullName, department, studentID etc.
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

// Pre-save hook to hash password before saving user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next(); // If password is not modified, move to next middleware
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;