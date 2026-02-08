import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  url: { type: String, required: true },
  stats: { type: String },
  description: { type: String },
  color: { type: String, default: 'bg-foreground' },
  order: { type: Number, default: 0 },
});

export default mongoose.model('Profile', profileSchema);
