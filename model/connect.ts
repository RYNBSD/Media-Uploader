import mongoose from "mongoose";
import { ENV } from "../constant";

let isConnected = false;

export async function connectToDb() {
  mongoose.set('strictQuery', true);

  if (isConnected) return;

  try {
    await mongoose.connect(ENV.MONGODB.URI || '')
    isConnected = true;
  } catch (error) {
    isConnected = false;
    console.error((error as Error).message);
  }
}