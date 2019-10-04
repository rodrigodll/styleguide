import React, { useMemo, useEffect, useReducer, useCallback } from 'react'

import Checkbox from '../Checkbox'
import { BulkActionsProps } from '../BulkActions'
import { NAMESPACES } from '../constants'

const useTableBulkActions = ({
  items,
  columns,
  bulkActions,
}: hookInput): hookReturn => {
  const [bulkState, dispatch] = useReducer(reducer, {
    selectedRows: [],
    allLinesSelected: false,
  })

  const hasPrimaryBulkAction = useMemo(
    () =>
      bulkActions &&
      bulkActions.main &&
      typeof bulkActions.main.onClick === 'function',
    [bulkActions]
  )

  const hasSecondaryBulkActions = useMemo(
    () => bulkActions && bulkActions.others && bulkActions.others.length > 0,
    [bulkActions]
  )

  const hasBulkActions = hasPrimaryBulkAction || hasSecondaryBulkActions

  const bulkedItems = useMemo(() => {
    return hasBulkActions && items.map((item, i) => ({ id: i, ...item }))
  }, [items, columns])

  const bulkedColumns = useMemo<Array<Column>>(() => {
    const headerRender = () => {
      const selectedRowsLength = bulkState.selectedRows.length
      const itemsLength = bulkedItems.length
      const isChecked = selectedRowsLength === itemsLength
      const isPartial =
        selectedRowsLength > 0 && selectedRowsLength < itemsLength

      return (
        <Checkbox
          checked={isChecked}
          onClick={selectAllVisibleRows}
          id={`${NAMESPACES.CHECKBOX}-all`}
          partial={isPartial}
        />
      )
    }

    const cellRender = ({ rowData }) => (
      <Checkbox
        checked={bulkState.selectedRows.some(row => row.id === rowData.id)}
        onClick={() => selectRow(rowData)}
        id={`${NAMESPACES.CHECKBOX}-${rowData.id}`}
        disabled={bulkState.allLinesSelected}
      />
    )

    return hasBulkActions
      ? [
          {
            id: 'bulk',
            width: 40,
            headerRender,
            cellRender,
          },
          ...columns,
        ]
      : columns
  }, [bulkState.selectedRows, bulkState.allLinesSelected])

  useEffect(() => {
    if (bulkActions && bulkActions.onChange) {
      const selectedParameters = bulkState.allLinesSelected
        ? { allLinesSelected: true }
        : { selectedRows: bulkState.selectedRows }
      bulkActions.onChange(selectedParameters)
    }
  }, [bulkState.selectedRows, bulkState.allLinesSelected, bulkActions])

  const selectAllRows = useCallback(
    () =>
      dispatch({
        type: ActionType.SelectAllRows,
        selectedRows: bulkedItems,
      }),
    [bulkState.selectedRows]
  )

  const deselectAllRows = useCallback(
    () => dispatch({ type: ActionType.DeselectAllRows }),
    [bulkState.selectedRows]
  )

  const selectRow = useCallback(
    (row: BulkedItem) => dispatch({ type: ActionType.SelectRow, row }),
    [bulkState.selectedRows]
  )

  const setSelectedRows = useCallback(
    (selectedRows: Array<BulkedItem>) =>
      dispatch({ type: ActionType.SetSelectedRows, selectedRows }),
    [bulkState.selectedRows]
  )

  const setAllLinesSelected = useCallback(
    (allLinesSelected: boolean) =>
      dispatch({
        type: ActionType.SetAllLinesSelected,
        allLinesSelected,
      }),
    [bulkState.allLinesSelected]
  )

  const selectAllVisibleRows = useCallback(
    () =>
      bulkState.selectedRows.length <= bulkedItems.length &&
      bulkState.selectedRows.length !== 0
        ? deselectAllRows()
        : setSelectedRows(bulkedItems),
    [bulkState.selectedRows, bulkState.allLinesSelected]
  )

  return {
    hasBulkActions,
    hasPrimaryBulkAction,
    hasSecondaryBulkActions,

    /** state */
    bulkState,

    /** data */
    bulkedColumns,
    bulkedItems,

    /** handler fn */
    selectAllRows,
    deselectAllRows,
    selectAllVisibleRows,
    selectRow,
    setSelectedRows,
    setAllLinesSelected,
  }
}

function reducer(state: BulkState, action: Action) {
  switch (action.type) {
    case ActionType.SetSelectedRows: {
      return {
        ...state,
        selectedRows: action.selectedRows,
      }
    }
    case ActionType.SetAllLinesSelected: {
      return {
        ...state,
        allLinesSelected: action.allLinesSelected,
      }
    }
    case ActionType.DeselectAllRows: {
      return {
        ...state,
        selectedRows: [],
        allLinesSelected: false,
      }
    }
    case ActionType.SelectAllRows: {
      return {
        ...state,
        selectedRows: action.selectedRows,
        allLinesSelected: true,
      }
    }
    case ActionType.SelectRow: {
      return state.selectedRows.some(
        selectedRow => selectedRow.id === action.row.id
      )
        ? {
            ...state,
            selectedRows: state.selectedRows.filter(
              row => row.id !== action.row.id
            ),
            allLinesSelected: false,
          }
        : {
            ...state,
            selectedRows: [...state.selectedRows, action.row],
          }
    }
    default: {
      return state
    }
  }
}

enum ActionType {
  SetSelectedRows,
  SetAllLinesSelected,
  DeselectAllRows,
  SelectAllRows,
  SelectRow,
}

type Action = {
  type: ActionType
  selectedRows?: Array<BulkedItem>
  allLinesSelected?: boolean
  row?: BulkedItem
}

type hookInput = {
  items: Array<Object>
  columns: Array<Column>
  bulkActions: BulkActionsProps
}

type hookReturn = {
  bulkedColumns?: Array<Column>
  bulkedItems?: Array<BulkedItem>
  bulkState?: BulkState
  hasBulkActions?: boolean
  hasPrimaryBulkAction?: boolean
  hasSecondaryBulkActions?: boolean
  selectAllRows?: () => void
  deselectAllRows?: () => void
  selectRow?: (row: BulkedItem) => void
  setSelectedRows?: (selectedRows: Array<BulkedItem>) => void
  setAllLinesSelected?: (allLinesSelected: boolean) => void
  selectAllVisibleRows?: () => void
}

export default useTableBulkActions
