const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued' },
  fine: { type: Number, default: 0 },         // Fine in rupees
  finePaid: { type: Boolean, default: false }  // Whether fine has been paid
});

// Virtual: Calculate current fine dynamically (₹5 per day overdue)
borrowSchema.virtual('currentFine').get(function () {
  if (this.status === 'returned') return this.fine;
  const now = new Date();
  if (now <= this.dueDate) return 0;
  const daysOverdue = Math.ceil((now - this.dueDate) / (1000 * 60 * 60 * 24));
  return daysOverdue * 5;
});

borrowSchema.set('toJSON', { virtuals: true });
borrowSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Borrow', borrowSchema);
