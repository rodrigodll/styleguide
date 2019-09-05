import React, { FC, InputHTMLAttributes } from 'react'

import { NAMESPACES, ORDER_CLASSNAMES } from '../constants'

export type InputCustomProps = InputHTMLAttributes<HTMLInputElement> & {
  input: Element
}

const UNSAFE_InputCustom: FC<InputCustomProps> = ({ input }) => {
  return (
    <span
      className={`${ORDER_CLASSNAMES.TOOLBAR_CHILD.INPUT} w-40`}
      id={NAMESPACES.TOOLBAR.INPUT_SEARCH}>
      {input}
    </span>
  )
}

export default UNSAFE_InputCustom
