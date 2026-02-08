import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: 'about' },
  bio: { type: String, required: true },
  education: [{
    degree: { type: String, required: true },
    school: { type: String, required: true },
    period: { type: String, required: true },
  }],
});

export default mongoose.model('About', aboutSchema);
