import EmptyState from '../common/EmptyState'
import { formatRupees } from '../../utils/currency'
import './Dashboard.css'

// Show each backend settlement as a payment from debtor to creditor.
function SettlementList({ settlements }) {
  return (
    <section className="dashboard-section" aria-labelledby="settlements-heading">
      <h3 id="settlements-heading">Settlement Suggestions</h3>
      {settlements.length === 0 ? (
        <EmptyState message="Everyone is settled up! No payments required." />
      ) : (
        <div className="settlement-list">
          {settlements.map((settlement, index) => (
            <article
              className="settlement-item"
              key={`${settlement.from.memberId}-${settlement.to.memberId}-${index}`}
            >
              <div>
                <h4>{settlement.from.name}</h4>
                <small>Owes</small>
              </div>
              <strong>{formatRupees(settlement.amountPaise)}</strong>
              <div>
                <h4>{settlement.to.name}</h4>
                <small>Receives</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default SettlementList
