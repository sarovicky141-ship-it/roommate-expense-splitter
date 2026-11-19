import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

// Report database connection status so clients can distinguish a healthy API
// from one that cannot currently serve database-backed requests.
router.get('/', (_request, response) => {
  const connected = mongoose.connection.readyState === 1

  response.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    database: connected ? 'connected' : 'disconnected',
  })
})

export default router
