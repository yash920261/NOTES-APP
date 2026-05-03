const mongoose = require('mongoose');

const SessionLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  ip_address: { type: String }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('SessionLog', SessionLogSchema);
