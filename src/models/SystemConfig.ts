import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  maintenanceMode: { type: Boolean, default: false },
  registrationsEnabled: { type: Boolean, default: true },
  updatedAt: { type: Number, default: Date.now },
});

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', systemConfigSchema);
