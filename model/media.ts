import { model, Schema, models } from "mongoose";
import { FileTypes } from "../types";

interface IModel {
  title: string;
  description?: string;
  type: FileTypes;
  uri: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

const mediaSchema = new Schema<IModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 255,
    },
    type: {
      type: String,
      require: true,
    },
    uri: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Media = models.Media || model("Media", mediaSchema);
