import mongoose, { Schema, models, model } from "mongoose";

export interface AdminUserDoc {
  _id: string;
  email: string;
  passwordHash: string;
}

const AdminUserSchema = new Schema<AdminUserDoc>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
});

export const AdminUser = models.AdminUser || model<AdminUserDoc>("AdminUser", AdminUserSchema);
export default AdminUser as mongoose.Model<AdminUserDoc>;
