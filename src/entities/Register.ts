import { Schema, model, Document } from 'mongoose';

export interface Register extends Document {
  name: string;
  email: string;
  status: boolean;
}

const registers = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  status: { type: Boolean, default: false },
});

const Registers = model<Register>('Exams', registers);

export default Registers;
