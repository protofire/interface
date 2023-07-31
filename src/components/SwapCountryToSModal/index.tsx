import { useState } from 'react'
import { Box } from 'rebass'

import { ButtonPrimary } from '../Button'
import Modal from '../Modal'

const SWAP_COUNTRY_TOS_KEY = 'SWAP_COUNTRY_TOS'

export default function SwapCountryToSModal() {
  const [isOpen, setIsOpen] = useState(() => {
    const didAgreeWithTerms = window.localStorage.getItem(SWAP_COUNTRY_TOS_KEY)
    return didAgreeWithTerms !== 'true'
  })

  const agreeWithTerms = () => {
    window.localStorage.setItem(SWAP_COUNTRY_TOS_KEY, 'true')
    setIsOpen(false)
  }

  return (
    <Modal isOpen={isOpen} maxWidth={860}>
      <Box display="flex" flexDirection="column" width="100%">
        <iframe
          src="https://doc.swap.country/terms-of-service-e096ae912a54464084a176f98127bf35"
          style={{ minHeight: '60vh' }}
          frameBorder={0}
          width="100%"
          allowFullScreen
        />
        <ButtonPrimary onClick={agreeWithTerms}>Agreed</ButtonPrimary>
      </Box>
    </Modal>
  )
}
