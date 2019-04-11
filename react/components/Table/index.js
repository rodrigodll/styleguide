import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import reduce from 'lodash/reduce'

import Box from '../Box'
import Button from '../Button'
import ButtonWithIcon from '../ButtonWithIcon'
import Close from '../icon/Close'
import Pagination from '../Pagination'
import EmptyState from '../EmptyState'
import ActionMenu from '../ActionMenu'
import FilterBar from '../EXPERIMENTAL_FilterBar'

import SimpleTable from './SimpleTable'
import Toolbar from './Toolbar'
import CheckboxContainer from './CheckboxContainer'
import Totalizers from './Totalizers'

const TABLE_HEADER_HEIGHT = 36
const EMPTY_STATE_SIZE_IN_ROWS = 5

const close = <Close />

class Table extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      hiddenFields: this.getInitialHiddenFieldsFromSchema(props.schema),
      tableRowHeight: this.getRowHeight(props.density),
      selectedDensity: props.density,
      allChecked: false,
      selectedRows: [],
      allLinesSelected: false,
    }
  }

  getInitialHiddenFieldsFromSchema = schema => {
    const hiddenFields = []
    Object.keys(schema.properties).forEach(key => {
      if (schema.properties[key].hidden) {
        hiddenFields.push(key)
      }
    })
    return hiddenFields
  }

  getRowHeight = density => {
    switch (density) {
      case 'low':
        return 76
      case 'medium':
        return 48
      case 'high':
        return 32
      default:
        return 45
    }
  }

  toggleTableRowHeight = density => {
    const { tableRowHeight } = this.state
    const newHeight = this.getRowHeight(density)
    if (tableRowHeight !== newHeight) {
      this.setState({
        tableRowHeight: newHeight,
        selectedDensity: density,
      })
    }
  }

  toggleColumn = key => {
    const { hiddenFields } = this.state
    const newFieldsArray = hiddenFields.slice()
    const index = hiddenFields.indexOf(key)
    index === -1 ? newFieldsArray.push(key) : newFieldsArray.splice(index, 1)
    this.setState({ hiddenFields: newFieldsArray })
  }

  onShowAllColumns = () => this.setState({ hiddenFields: [] })

  onHideAllColumns = () =>
    this.setState({ hiddenFields: Object.keys(this.props.schema.properties) })

  calculateTableHeight = totalItems => {
    const { tableRowHeight } = this.state
    const multiplicator =
      totalItems !== 0 ? totalItems : EMPTY_STATE_SIZE_IN_ROWS
    return TABLE_HEADER_HEIGHT + tableRowHeight * multiplicator
  }

  handleSelectAllLines = () => {
    const { items: selectedRows } = this.props
    this.setState({ selectedRows, allLinesSelected: true })
  }

  handleSelectAllVisibleLines = () => {
    const selectedRows = this.state.selectedRows.slice(0)
    const { items } = this.props
    const itemsLength = items.length

    if (selectedRows.length === itemsLength) {
      this.handleDeselectAllLines()
    } else {
      this.setState({ selectedRows: items })
    }
  }

  handleSelectLine = rowData => {
    const selectedRows = this.state.selectedRows.slice(0)
    const { id } = rowData

    if (selectedRows.some(el => el.id === id)) {
      const filteredRows = selectedRows.filter(row => row.id !== id)
      this.setState({ selectedRows: filteredRows })
    } else {
      selectedRows.push({ ...rowData })
      this.setState({ selectedRows })
    }
  }

  handleDeselectAllLines = () => {
    this.setState({ selectedRows: [], allLinesSelected: false })
  }

  render() {
    const {
      items,
      schema,
      disableHeader,
      emptyStateLabel,
      emptyStateChildren,
      fixFirstColumn,
      onRowClick,
      sort,
      onSort,
      updateTableKey,
      containerHeight,
      toolbar,
      pagination,
      fullWidth,
      lineActions,
      loading,
      bulkActions,
      totalizers,
      filters,
    } = this.props
    const {
      hiddenFields,
      tableRowHeight,
      selectedDensity,
      selectedRows,
      allLinesSelected,
    } = this.state

    const hasPrimaryBulkAction =
      bulkActions &&
      bulkActions.main &&
      typeof bulkActions.main.onClick === 'function'
    const hasSecondaryBulkActions =
      bulkActions.others && bulkActions.others.length > 0
    const hasBulkActions = hasPrimaryBulkAction || hasSecondaryBulkActions

    if (hasBulkActions) {
      schema.properties = {
        bulk: {
          width: 40,
          headerRenderer: () => (
            <CheckboxContainer
              checked={this.state.selectedRows.length === items.length}
              onClick={this.handleSelectAllVisibleLines}
              id="all"
            />
          ),
          cellRenderer: ({ rowData }) => (
            <CheckboxContainer
              checked={this.state.selectedRows.some(
                row => row.id === rowData.id
              )}
              onClick={() => this.handleSelectLine(rowData)}
              id={rowData.id}
            />
          ),
        },
        ...schema.properties,
      }

      items.map((item, i) => (item.id = i))
    }

    const properties = Object.keys(schema.properties)
    const emptyState = !!(
      properties.length === 0 || properties.length === hiddenFields.length
    )
    const displayProperties = reduce(
      schema.properties,
      (acc, value, key) => {
        if (hiddenFields.includes && hiddenFields.includes(key)) {
          return acc
        }
        return { ...acc, [key]: value }
      },
      {}
    )
    const displaySchema = {
      ...schema,
      properties: displayProperties,
    }

    const buldkActionsReturnedParameters = allLinesSelected
      ? { allLinesSelected: true }
      : { selectedRows }

    return (
      <div className="vtex-table__container">
        {toolbar && (
          <Toolbar
            loading={loading}
            toolbar={toolbar}
            hiddenFields={hiddenFields}
            toggleColumn={this.toggleColumn}
            handleHideAllColumns={this.onHideAllColumns}
            handleShowAllColumns={this.onShowAllColumns}
            handleToggleDensity={this.toggleTableRowHeight}
            selectedDensity={selectedDensity}
            schema={schema}
            actions={toolbar}
          />
        )}
        {filters && (
          <div className="mb5">
            <FilterBar {...filters} />
          </div>
        )}
        {totalizers && totalizers.length > 0 && (
          <Totalizers items={totalizers} />
        )}

        {selectedRows.length > 0 && (
          <div className="flex flex-row justify-between pa4 bg-action-primary c-on-action-primary br3 br--top">
            {hasBulkActions && (
              <div className="flex flex-row">
                {hasPrimaryBulkAction && (
                  <div className="mr4">
                    <Button
                      variation="secondary"
                      onClick={() =>
                        bulkActions.main.onClick(buldkActionsReturnedParameters)
                      }>
                      {bulkActions.main.label}
                    </Button>
                  </div>
                )}
                {hasSecondaryBulkActions && (
                  <ActionMenu
                    label={bulkActions.texts.secondaryActionsLabel}
                    buttonProps={{ variation: 'secondary' }}
                    options={bulkActions.others.map(el => ({
                      label: el.label,
                      onClick: () => el.onClick(buldkActionsReturnedParameters),
                    }))}
                  />
                )}
              </div>
            )}
            <div className="tr">
              {!allLinesSelected && (
                <span className="mr4 c-muted-4">
                  {selectedRows.length} {bulkActions.texts.rowsSelected}
                </span>
              )}
              <span className="mr2">
                {allLinesSelected ? (
                  <span>
                    {bulkActions.texts.allRowsSelected}{' '}
                    <span className="b">{bulkActions.totalItems}</span>
                  </span>
                ) : (
                  <Button onClick={this.handleSelectAllLines}>
                    <span className="ttu">
                      {`${bulkActions.texts.selectAll} ${
                        bulkActions.totalItems
                      }`}
                    </span>
                  </Button>
                )}
              </span>
              <ButtonWithIcon
                icon={close}
                onClick={this.handleDeselectAllLines}
              />
            </div>
          </div>
        )}
        {emptyState ? (
          <Box>
            <EmptyState title={emptyStateLabel}>
              {emptyStateChildren}
            </EmptyState>
          </Box>
        ) : (
          <SimpleTable
            fullWidth={fullWidth}
            items={items}
            schema={displaySchema}
            fixFirstColumn={fixFirstColumn}
            rowHeight={tableRowHeight}
            disableHeader={disableHeader}
            emptyStateLabel={emptyStateLabel}
            emptyStateChildren={emptyStateChildren}
            onRowClick={onRowClick}
            sort={sort}
            onSort={onSort}
            key={hiddenFields.toString()}
            updateTableKey={updateTableKey}
            lineActions={lineActions}
            loading={loading}
            containerHeight={
              containerHeight || this.calculateTableHeight(items.length)
            }
          />
        )}
        {!loading && pagination && <Pagination {...pagination} />}
      </div>
    )
  }
}

Table.defaultProps = {
  loading: false,
  density: 'medium',
  fixFirstColumn: false,
  toolbar: {
    extraActions: {
      actions: [],
    },
  },
  emptyStateLabel: 'Nothing to show.',
  fullWidth: false,
  bulkActions: {},
  totalizers: [],
}

Table.propTypes = {
  /** Array of objects with data */
  items: PropTypes.array.isRequired,
  /** Json Schema data model for the items (example: https://jsonschema.net/) for custom examples see code from custom components */
  schema: PropTypes.object.isRequired,
  /** Do not render the table header (only the rows) */
  disableHeader: PropTypes.bool,
  /** Fix first column so only the following ones scroll horizontaly */
  fixFirstColumn: PropTypes.bool,
  /** Callback invoked when a user clicks on a table row. ({ event: Event, index: number, rowData: any }): void */
  onRowClick: PropTypes.func,
  /** Sort order and which property (key in schema) is table data sorted by. */
  sort: PropTypes.shape({
    sortOrder: PropTypes.oneOf(['ASC', 'DESC']),
    sortedBy: PropTypes.string,
  }),
  /** Callback to handle sort ({ sortOrder, sortedBy }) : object */
  onSort: PropTypes.func,
  /** Forces table re-render when changed */
  updateTableKey: PropTypes.string,
  /** In case you need precise control of table container height (number in pixels)  */
  containerHeight: PropTypes.number,
  /** Row info visual density  */
  density: PropTypes.oneOf(['low', 'medium', 'high']),
  /** Label for emptystate  */
  emptyStateLabel: PropTypes.string,
  /** Children for emptystate  */
  emptyStateChildren: PropTypes.node,
  /** Full width property  */
  fullWidth: PropTypes.bool,
  /** Line actions column */
  lineActions: PropTypes.arrayOf(
    PropTypes.shape({
      /** Function that returns a string for the action label */
      label: PropTypes.func,
      /** Mark whether the action performs a dangerous option or not */
      isDangerous: PropTypes.bool,
      /** Handles the callback function of the action */
      onClick: PropTypes.func,
    })
  ),
  /** Controls the table loading state */
  loading: PropTypes.bool,
  /** Toolbar (search and actions) */
  toolbar: PropTypes.shape({
    inputSearch: PropTypes.shape({
      onSubmit: PropTypes.func,
    }),
    density: PropTypes.shape({
      buttonLabel: PropTypes.string,
      lowOptionLabel: PropTypes.string,
      mediumOptionLabel: PropTypes.string,
      highOptionLabel: PropTypes.string,
      alignMenu: PropTypes.oneOf(['right', 'left']),
    }),
    fields: PropTypes.shape({
      label: PropTypes.string,
      showAllLabel: PropTypes.string,
      hideAllLabel: PropTypes.string,
      alignMenu: PropTypes.oneOf(['right', 'left']),
    }),
    download: PropTypes.shape({
      label: PropTypes.string,
      handleCallback: PropTypes.func,
    }),
    upload: PropTypes.shape({
      label: PropTypes.string,
      handleCallback: PropTypes.func,
    }),
    extraActions: PropTypes.shape({
      label: PropTypes.string,
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          handleCallback: PropTypes.func,
        })
      ),
      alignMenu: PropTypes.oneOf(['right', 'left']),
    }),
    newLine: PropTypes.shape({
      label: PropTypes.string.isRequired,
      handleCallback: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
    }),
  }),
  pagination: PropTypes.shape({
    onNextClick: PropTypes.func,
    onPrevClick: PropTypes.func,
    currentItemFrom: PropTypes.number,
    currentItemTo: PropTypes.number,
    textOf: PropTypes.string,
    totalItems: PropTypes.number,
  }),
  bulkActions: PropTypes.object,
  /** Totalizers property  */
  totalizers: PropTypes.array,
  /** Filters property  */
  filters: PropTypes.shape({ ...FilterBar.propTypes }),
}

export default Table
