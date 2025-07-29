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
