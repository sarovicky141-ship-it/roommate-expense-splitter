const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Shared JSON request handling keeps API errors consistent across services.
async function sendRequest(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new Error('Could not connect to the server. Please try again.')
  }

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(result.error || 'The request could not be completed.')
  }

  return result
}

export { sendRequest }
