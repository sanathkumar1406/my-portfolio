import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: 'siteSettings' },
  footerLinks: {
    github: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    email: { type: String },
  },
});

export default mongoose.model('SiteSettings', siteSettingsSchema);
