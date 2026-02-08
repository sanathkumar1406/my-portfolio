import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  icon: { type: String, required: true },
  skills: [{ type: String }],
  order: { type: Number, default: 0 },
});

export default mongoose.model('Skill', skillSchema);
