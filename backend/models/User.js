const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Validate Indian phone number format (10 digits starting with 6-9)
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  language: {
    type: String,
    trim: true,
    enum: {
      values: [
        'English',
        'हिंदी (Hindi)',
        'मराठी (Marathi)',
        'ಕನ್ನಡ (Kannada)',
        'தமிழ் (Tamil)',
        'తెలుగు (Telugu)',
        'ગુજરાતી (Gujarati)',
        'বাংলা (Bengali)'
      ],
      message: 'Please select a valid language'
    },
    default: 'English'
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ createdAt: -1 });

// Instance method to hash password
userSchema.methods.hashPassword = async function() {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
};

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get user without password
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find user by phone
userSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone });
};

// Static method to find user by phone with password (for authentication)
userSchema.statics.findByPhoneWithPassword = function(phone) {
  return this.findOne({ phone }).select('+password');
};

// Static method to create user with hashed password
userSchema.statics.createUser = async function(userData) {
  const user = new this(userData);
  await user.hashPassword();
  return await user.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;