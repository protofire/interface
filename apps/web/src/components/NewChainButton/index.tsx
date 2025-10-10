import { SmallButtonPrimary } from 'components/Button'
import { Link } from 'react-router-dom'

export default function NewChainButton() {
  return (
    <SmallButtonPrimary as={Link} to="/">
      Add a new chain
    </SmallButtonPrimary>
  )
}
