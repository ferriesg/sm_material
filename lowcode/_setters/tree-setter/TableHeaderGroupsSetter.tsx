import { SettingField } from '@alilc/lowcode-engine'
import { isNil } from 'lodash'
import React, { createElement } from 'react'
import { uuid } from './utils'
import TreeSetter, { ITreeNode } from '.'
import { Table } from 'antd'
import { Typography } from '@alifd/next'

export interface ITableHeaderGroupsProps {
  field: SettingField
  value: IGroupNode[]
  onChange: (value?: IGroupNode[]) => void
}

export enum GroupNodeTypes {
  column = 'column',
  group = 'group',
}

export interface IBaseColumn {
  title?: string
  key: string
  dataIndex: string
  colSpan?: number
}

export interface IGroupNode extends ITreeNode {
  type?: GroupNodeTypes
  children?: IGroupNode[]
  dataIndex?: string
  colSpan?: number
}

const column2Node = (column: IBaseColumn): IGroupNode => {
  return {
    title: typeof column.title === 'string' ? column.title : `[${column.dataIndex}]`,
    dataIndex: column.dataIndex,
    key: column.key,
    colSpan: isNil(column.colSpan) ? 1 : column.colSpan,
    type: GroupNodeTypes.column,
  }
}
export class TableHeaderGroupsSetter extends React.Component<
  ITableHeaderGroupsProps,
  { data: IGroupNode[] }
> {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
    }
  }

  componentDidMount() {
    this.syncColumnsField()
  }

  handleChange = (treeData) => {
    const { onChange, field } = this.props
    onChange?.(treeData)
    try {
      if (!isNil(treeData)) {
        field.parent.setPropValue('bordered', true)
      }
    } catch {}
  }

  isDropAllowed = ({ dropNode, dropPosition }): boolean => {
    // if a node drop into a 'column' node
    if (dropNode.type === GroupNodeTypes.column && !dropPosition) return false
    return true
  }

  syncColumnsField = () => {
    const { value } = this.props
    const headerGroups = this.mergeColumnAndHeaderGroups(value)
    this.setState({
      data: headerGroups,
    })
  }

  mergeColumnAndHeaderGroups = (headerGroups?: IGroupNode[]) => {
    const { props } = this
    const { field } = props
    const columns: IBaseColumn[] = field.parent.getPropValue('columns')
    let data: IGroupNode[] = []
    if (isNil(headerGroups)) {
      data = [...columns.map(column2Node)]
    } else {
      const traverse = (
        treeData: IGroupNode[],
        groupedSet: Map<string, IBaseColumn>,
      ): IGroupNode[] => {
        return treeData
          .map((node) => {
            if (
              Array.isArray(node.children) &&
              (!node.type || node.type === GroupNodeTypes.group)
            ) {
              node.children = traverse(node.children, groupedSet)
            }
            if (node.type === GroupNodeTypes.column) {
              if (!groupedSet.has(node.key)) return null
              const newNode = column2Node(groupedSet.get(node.key) as IBaseColumn)
              groupedSet.delete(node.key)
              return newNode
            }
            return node
          })
          .filter((node) => !isNil(node)) as IGroupNode[]
      }
      const keyColumnMap: Map<string, IBaseColumn> = new Map(
        columns.map((column) => [column.key, column]),
      )
      const groups = traverse(headerGroups, keyColumnMap)
      data = columns
        .filter((column) => keyColumnMap.has(column.key as string))
        .map(column2Node)
        .concat(groups)
    }
    return data
  }

  render() {
    return (
      <TreeSetter
        {...this.props}
        value={this.state.data}
        onChange={this.handleChange}
        beforeDialogVisible={this.syncColumnsField}
        allowDrop={this.isDropAllowed}
        addButtonProps={{
          text: '添加分组',
        }}
        initialValue={() => ({
          title: '新分组',
          type: GroupNodeTypes.group,
          key: 'group_' + uuid(),
        })}
        renderLabel={(node) => {
          return (
            <>
              <span>{node.title || (node.dataIndex && `[${node.dataIndex}]`)}</span>
              {/*
                // TODO: realize it
                { node.type === GroupNodeTypes.column && <Input type='number' defaultValue={node.colSpan} /> }
                 */}
            </>
          )
        }}
        showEdit={(node) => !node.type || (node as IGroupNode).type === GroupNodeTypes.group}
        showDelete={(node) => !node.type || (node as IGroupNode).type === GroupNodeTypes.group}
        updateDataAfterDelete={(newTreeData) => {
          return this.mergeColumnAndHeaderGroups(newTreeData as IGroupNode[])
        }}
        preview={(treeData) => {
          return (
            <>
              <Typography.H3>预览：</Typography.H3>
              <div style={{ width: 800 }}>
                <Table columns={treeData} bordered dataSource={[]} scroll={{ y: 0, x: '100%' }} />
              </div>
            </>
          )
        }}
      />
    )
  }
}

export default TableHeaderGroupsSetter
