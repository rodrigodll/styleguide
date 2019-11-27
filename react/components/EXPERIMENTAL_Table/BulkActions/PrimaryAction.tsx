import React, { FC } from 'react'
import Button from '../../Button'

const PrimaryAction: FC<PrimaryProps> = ({ label, onClick }) => {
  return (
    <div className="mr4">
      <Button variation="secondary" size="small" onClick={onClick}>
        {label}
      </Button>
    </div>
  )
}

type PrimaryProps = {
  label: string
  onClick: () => /** bulkActionsReturnedParameters */ void
}

export default PrimaryAction
