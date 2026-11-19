// Render API or form errors with alert semantics for assistive technology.
function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <p className="message message-error" role="alert">
      {message}
    </p>
  )
}

export default ErrorMessage
