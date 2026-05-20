import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['manager', 'member'], default: 'member' },
  image:    { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('id').get(function () { return this._id.toHexString(); });

userSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random&color=fff&size=128`;
  }
  next();
});

export default mongoose.model('User', userSchema);
