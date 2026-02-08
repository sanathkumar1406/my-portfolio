import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: 'contact' },
  email: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  description: { type: String },
  socialLinks: {
    github: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    email: { type: String },
    website: { type: String },
  },
});

export default mongoose.model('Contact', contactSchema);
