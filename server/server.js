import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import connectDB from './config/db.js'
import groupRoutes from './routes/groupRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import healthRoutes from './routes/healthRoutes.js'

// ENVIRONMENT AND SERVER CONFIGURATION
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: resolve(projectRoot, '.env') })

const app = express()
const port = process.env.PORT || 5000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

// MIDDLEWARE AND API ROUTES
app.use(cors({ origin: clientUrl }))
app.use(express.json())
app.use('/api/health', healthRoutes)
app.use('/api/groups', groupRoutes)
app.use(notFound)
app.use(errorHandler)

// SERVER AND DATABASE STARTUP
app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
})

connectDB().catch((error) => {
  console.error(`MongoDB connection failed: ${error.message}`)
})
