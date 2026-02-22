import mongoose from 'mongoose';

const messMenuSchema = new mongoose.Schema({
  hostelName: { type: String, required: true }, // e.g., BH-1, BH-4
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
  items: { type: String, required: true },
  date: { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('MessMenu', messMenuSchema);