const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  progress: {
    type: Map,
    of: Number,
    default: {
      'arrow-path': 1,
      'memory-grid': 1,
      'arithmetic-speed': 1,
      'number-series': 1,
      'logic-decision': 1
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
