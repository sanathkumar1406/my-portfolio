import mongoose from 'mongoose';

const homeSchema = new mongoose.Schema({
  id: { type: String, default: 'home', unique: true },
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  resumeUrl: { type: String },
  photoUrl: { type: String },
  availableForOpportunities: { type: Boolean, default: true },
});

export default mongoose.model('Home', homeSchema);
