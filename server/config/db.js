import mongoose from 'mongoose'

// ==========================================
// DATABASE CONNECTION
// ==========================================
async function connectDB() {
  const { MONGO_URI } = process.env

  // Fail explicitly instead of trying to connect without database configuration.
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it to the project root .env file.')
  }

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  return mongoose.connection
}

export default connectDB
