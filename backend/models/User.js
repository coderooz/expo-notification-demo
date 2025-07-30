const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('User', userSchema);
