// filepath: /workspaces/javascript-node-postgres/Major-Project-Full-Stack-Development-22023230/packages/db/src/models/Purchase.ts
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export const Purchase = mongoose.model("Purchase", purchaseSchema);