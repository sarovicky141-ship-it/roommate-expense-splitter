import { formatRupees } from '../../utils/currency'
import './Dashboard.css'

// Display backend-calculated paid, share, and net balance values.
function BalanceSummary({
  balances,
  onExportCsv,
  exportDisabled,
  exportMessage,
}) {
  return (
    <section className="dashboard-section" aria-labelledby="balance-heading">
      <div className="dashboard-section-heading">
        <h3 id="balance-heading">Member Balances</h3>
        <button
          className="button button-export-csv export-csv-button"
          type="button"
          onClick={onExportCsv}
          disabled={exportDisabled}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M3.5 13v3.5h13V13"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
          </svg>
          Export CSV
        </button>
      </div>
      {exportMessage && (
        <p
          className={`message export-message message-${exportMessage.type}`}
          role={exportMessage.type === 'error' ? 'alert' : 'status'}
        >
          {exportMessage.text}
        </p>
      )}
      <p className="field-hint">
        Positive balance means the member should receive money. Negative balance
        means the member owes money.
      </p>
      <div className="balance-list">
        {balances.map((balance) => (
          <article className="balance-item" key={balance.memberId}>
            <div>
              <h4>{balance.name}</h4>
              <p>Paid: {formatRupees(balance.totalPaidPaise)}</p>
              <p>Share: {formatRupees(balance.totalSharePaise)}</p>
            </div>
            <div className="balance-total">
              <strong
                className={
                  balance.netBalancePaise > 0
                    ? 'positive'
                    : balance.netBalancePaise < 0
                      ? 'negative'
                      : 'settled'
                }
              >
                {balance.netBalancePaise > 0
                  ? '+'
                  : balance.netBalancePaise < 0
                    ? '-'
                    : ''}
                {formatRupees(Math.abs(balance.netBalancePaise))}
              </strong>
              <small>
                {balance.netBalancePaise > 0
                  ? 'Gets back'
                  : balance.netBalancePaise < 0
                    ? 'Owes'
                    : 'Settled'}
              </small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default BalanceSummary
