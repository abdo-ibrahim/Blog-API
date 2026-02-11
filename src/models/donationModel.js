const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    amount: { type: Number, required: true },
    orderId: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
    sessionURL: { type: String },
    webhookData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

// ===== INDEXES =====
// Unique indexes for identifiers
donationSchema.index({ sessionId: 1 }, { unique: true }); // No duplicate sessions
donationSchema.index({ orderId: 1 }, { unique: true }); // No duplicate orders

// Indexes for status queries
donationSchema.index({ status: 1 }); // Find donations by status
donationSchema.index({ status: 1, createdAt: -1 }); // Status sorted by date

// Date indexes for reporting
donationSchema.index({ createdAt: -1 }); // For sorting donations by date
donationSchema.index({ createdAt: 1, status: 1 }); // For date range + status queries

// Compound index for common analytics queries
donationSchema.index({ status: 1, amount: 1 }); // For revenue analytics

const Donation = mongoose.model("donations", donationSchema);

module.exports = Donation;
