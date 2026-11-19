// Convert unmatched requests into the same JSON error format as other API errors.
function notFound(request, _response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`)
  error.status = 404
  next(error)
}

// Centralize final HTTP error responses and log unexpected server failures.
function errorHandler(error, _request, response, _next) {
  const status = error.status || 500

  if (status >= 500) {
    console.error(error)
  }

  response.status(status).json({
    error: status === 500 ? 'Internal server error' : error.message,
  })
}

export { errorHandler, notFound }
