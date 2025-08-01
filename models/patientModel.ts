import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPatient extends Document {
  name: string;
  address: string;
  registrationNumber: string;
  birthPlace: string;
  birthDay: string;
}

const patientSchema: Schema<IPatient> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    birthPlace: {
      type: String,
      required: true,
    },
    birthDay: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to combine birthPlace and birthDay
patientSchema.virtual("fullBirthInfo").get(function () {
  return `${this.birthPlace}, ${this.birthDay}`;
});

// Add indexes for better performance on searches and pagination
patientSchema.index({ name: 1 }); 
patientSchema.index({ address: 1 });
// registrationNumber already has unique index, no need for explicit index
patientSchema.index({ createdAt: -1 });
patientSchema.index({ updatedAt: -1 });

// Compound index for name prefix search (alphabet functionality)
patientSchema.index({ name: 1, createdAt: -1 });

// Text index for full-text search functionality
patientSchema.index({
  name: "text",
  registrationNumber: "text",
  address: "text",
  birthPlace: "text",
});

// Override toJSON to replace birthDay with fullBirthInfo
patientSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    ret.birthDay = `${doc.birthPlace}, ${doc.birthDay}`;
    delete ret.birthPlace;
    delete ret.fullBirthInfo;
    delete ret.id;
    return ret;
  },
});

const PatientModel: Model<IPatient> = mongoose.model("Patient", patientSchema);

export default PatientModel;
