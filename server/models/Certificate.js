import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'image'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Certificate', certificateSchema);
