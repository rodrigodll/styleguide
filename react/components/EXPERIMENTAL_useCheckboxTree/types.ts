import { ROOT_KEY } from './constants'

export type ChildKey<T> = { [key: string]: Array<T> }

export type comparatorCurry<T> = (item: T) => (candidate: T) => boolean

export type Checkboxes<T> = {
  checkedItems: Tree<T>[]
  isChecked: (item: T) => boolean
  isPartiallyChecked: (item: T) => boolean
  itemTree: {
    [x: string]: string | T[]
    [ROOT_KEY]: string
  }
  toggle: (item: T) => void
  check: (item: T) => void
  uncheck: (item: T) => void
}

export type Tree<T> = { [x: string]: string | T[]; [ROOT_KEY]: string } | T

export type useChecboxesInput<T> = {
  items: Array<T>
  onToggle?: ({ checkedItems }) => void
  nodesKey?: string
  checked?: Array<unknown>
  comparator?: comparatorCurry<Tree<T>>
}