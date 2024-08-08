import { TableProps } from 'antd'
import React, { useEffect, useState } from 'react'
import { isNil } from 'lodash'
import { GroupNodeTypes } from '../../../lowcode/_setters/tree-setter/TableHeaderGroupsSetter'
import { ColumnType, ColumnsType } from 'antd/lib/table'

export interface ICustomColumnType<T> extends ColumnType<T> {
  filterType: 'off' | 'default' | 'custom'
}
export interface ICustomTableProps<T> extends TableProps<T> {
  columns: ICustomColumnType<any>[]
  headerGroups?: Array<any> // can not import type from 'lowcode' path
  emptyText?: string
  scrollTo?: number
  ellipsisWidth?: number
  columnsDraggable?: boolean
  onColumnsSort?: (columns: ColumnsType<any>[]) => void
  id?: string
  recordColumnsOrder?: boolean
}

export const getTableColumnOrderStorageId = (id: string) => `${id}_columns_order`

export const useColumnsOrder = (
  columnsDraggable: boolean | undefined,
  id: string | undefined,
  recordColumnsOrder: boolean | undefined,
) => {
  const [columnsOrder, setColumnsOrder] = useState<ColumnType<any>['dataIndex'][]>([])

  useEffect(() => {
    try {
      if (columnsDraggable && id && recordColumnsOrder) {
        const sortingOrder = localStorage.getItem(getTableColumnOrderStorageId(id))
        if (sortingOrder) {
          const order = JSON.parse(sortingOrder) as ColumnType<any>['dataIndex'][] | null
          setColumnsOrder(order || [])
        }
      }
    } catch (ex) {}
  }, [])

  return [columnsOrder, setColumnsOrder] as const
}

const useTableColumns = (
  props: ICustomTableProps<any>,
  columnsOrder: ColumnType<any>['dataIndex'][],
): ColumnsType<any> => {
  const { headerGroups, columns: columnProps, columnsDraggable, id } = props
  const data = React.useMemo(() => props?.dataSource || [], [props])

  const sortedColumns = React.useMemo(() => {
    let columns = columnProps
    if (columnsDraggable && id) {
      if (columnsOrder.length) {
        // 恢复列顺序
        columns = columns.sort((right, left) => {
          if (left.fixed || right.fixed) {
            return 0
          }
          return columnsOrder.indexOf(right.dataIndex) - columnsOrder.indexOf(left.dataIndex)
        })
      }
      columns = columns.map((column) => {
        if (column.dataIndex && !column.fixed) {
          // 支持拖拽的列添样式
          column.className = 'th-draggable'
          // 添加dataIndex用来校准拖拽时列index
          column.title = (
            <span className="th-draggable-title" data-column-data-index={column.dataIndex}>
              {column.title}
            </span>
          )
        }
        return column
      })
    }
    return columns
  }, [columnProps, columnsOrder])

  const columnList = React.useMemo(() => {
    return (sortedColumns || []).map((column) => {
      if (column.filterType === 'default') {
        const dataIndex = (column as ColumnType<any>).dataIndex as string
        const filterValues = new Set()
        if (Array.isArray(data)) {
          data.forEach((item) => {
            const value = item[dataIndex]
            if (!value || Array.isArray(value) || typeof value === 'object') return
            filterValues.add(value)
          })
        }
        return {
          ...column,
          filters: Array.from(filterValues).map((val) => ({ text: val, value: val })),
          onFilter: (value, record) => {
            return record?.[dataIndex] === value
          },
        }
      } else if (column.filterType === 'off') delete column.filters
      return column
    })
  }, [sortedColumns])

  const sortedColumnKeys = React.useMemo<[string, string][]>(() => {
    if (isNil(headerGroups))
      return columnList.map((column) => [
        column.key as string,
        (column as ColumnType<any>).dataIndex as string,
      ])
    const columnKeys: [string, string][] = []
    const traverse = (list) => {
      list.forEach((node) => {
        if (node.type !== GroupNodeTypes.column && Array.isArray(node.children)) {
          traverse(node.children)
        } else {
          columnKeys.push([node.key as string, node.dataIndex as string])
        }
      })
    }
    traverse(headerGroups)
    return columnKeys
  }, [headerGroups, columnList])

  const getPrevColumnDataIndex = React.useCallback(
    (columnKey: string): string => {
      const currentIndex = sortedColumnKeys.findIndex(
        (columnConfig) => columnConfig[0] === columnKey,
      )
      if (currentIndex <= 0) return ''
      return sortedColumnKeys[currentIndex - 1][1]
    },
    [sortedColumnKeys],
  )

  const mapOnCellForColumnFn = React.useCallback(
    (column) => {
      const { onCell, ...others } = column
      if (typeof onCell === 'boolean' && onCell) {
        return {
          ...others,
          onCell(record, index: number) {
            const prevColumnDataIndex = getPrevColumnDataIndex(column.key)
            // Currently dataIndex is a string, need to change if dataIndex support array
            const dataIndex = column.dataIndex
            if (
              index > 0 &&
              data[index - 1]?.[dataIndex] === record[dataIndex] &&
              (!prevColumnDataIndex ||
                data[index - 1]?.[prevColumnDataIndex] === record[prevColumnDataIndex])
            ) {
              return {
                rowSpan: 0,
              }
            }
            let rowSpan = 1
            while (
              index + rowSpan < data.length &&
              data[index + rowSpan]?.[dataIndex] === record[dataIndex] &&
              (!prevColumnDataIndex ||
                data[index + rowSpan]?.[prevColumnDataIndex] === record[prevColumnDataIndex])
            ) {
              rowSpan++
            }
            return {
              rowSpan,
            }
          },
        }
      } else if (typeof onCell === 'function') {
        return {
          ...others,
          onCell: (record, index) => {
            return onCell(record, index, data)
          },
        }
      }
      return column
    },
    [data, getPrevColumnDataIndex],
  )

  const columns = React.useMemo(() => {
    if (isNil(headerGroups)) {
      // headerGroups是树形配置列头，如果没有配置headerGroups则使用该逻辑
      return (columnList || []).filter((item: any) => !item?.hidden).map(mapOnCellForColumnFn)
    }

    // 空数组，直接返回
    if (!Array.isArray(columnList)) return []

    // 定义一个Map，存储columns
    const keyColumnMap = new Map<string, number>()
    for (let i = 0; i < columnList.length; i++) {
      keyColumnMap.set(columnList[i].key as string, i)
    }

    const traverse = (list) => {
      if (!Array.isArray(list)) return []

      return list
        .map((item) => {
          // item is group
          if (item.type !== GroupNodeTypes.column && Array.isArray(item.children)) {
            return {
              ...item,
              children: traverse(item.children),
            }
          }
          if (!keyColumnMap.has(item.key)) return null
          const columnIndex = keyColumnMap.get(item.key)
          keyColumnMap.delete(item.key)
          return mapOnCellForColumnFn(columnList[columnIndex])
        })
        .filter((item) => !!item)
    }

    const groups = traverse(headerGroups)

    return Array.from(keyColumnMap)
      .map(([, columnIndex]) => columnList[columnIndex])
      .map(mapOnCellForColumnFn)
      .concat(groups)
  }, [headerGroups, columnList, mapOnCellForColumnFn])

  return columns as any
}

export default useTableColumns
