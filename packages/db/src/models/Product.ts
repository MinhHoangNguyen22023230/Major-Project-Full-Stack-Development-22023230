// filepath: /workspaces/javascript-node-postgres/Major-Project-Full-Stack-Development-22023230/packages/db/src/models/Product.ts
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  stock: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model("Product", productSchema);