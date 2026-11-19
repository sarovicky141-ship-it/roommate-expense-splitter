// Reusable status text for pending data requests.
function Loading({ message = 'Loading...' }) {
  return <p className="empty-state" role="status">{message}</p>
}

export default Loading
