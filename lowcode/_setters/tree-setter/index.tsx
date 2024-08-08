import React, { createElement, Component, isValidElement } from 'react'
import { Button, Typography, Dialog, Icon, Message, Input } from '@alifd/next'
import { Tree, TreeProps } from 'antd'
import { useCallback } from 'react'
import { uuid } from './utils'
import { EventDataNode } from 'antd/lib/tree'
import { handleTreeNodeByKey, generateTreeNodeIndex, indexSymbol } from './utils'
import { SettingField } from '@alilc/lowcode-engine'
import { useState } from 'react'
import { clone } from 'lodash'

export type ITreeNode = {
  [indexSymbol]?: string
  [key: string]: any
} & {
  title?: string
  key: string
  type?: string
  children?: ITreeNode[]
}

export interface ITreeSetterProps extends Omit<TreeProps, 'onChange'> {
  value?: ITreeNode[]
  onChange?: (value: ITreeNode[]) => void
  beforeDialogVisible?: () => void
  title?: string
  field?: SettingField
  showEdit?: (node: ITreeNode) => boolean
  showDelete?: (node: ITreeNode) => boolean
  initialValue?: () => ITreeNode
  addButtonProps?: {
    text: string
  }
  renderLabel?: (node: ITreeNode) => void
  updateDataAfterDelete?: (newData: ITreeNode[]) => ITreeNode[]
  preview?: (data: ITreeNode[]) => React.ReactNode
}

interface ITreeDialogProps extends ITreeSetterProps {
  onConfirm?: (value: ITreeNode[]) => void
  onClose: () => void
  visible: boolean
}

export const NODE_TYPE_ADD = 'add'

// Insert a 'add' type node to add new items.
const insertAdditionNode = (treeData: ITreeNode[], parentIndex?: string): ITreeNode[] => {
  return treeData
    .map((node) => {
      if (Array.isArray(node.children)) {
        return {
          ...node,
          children: insertAdditionNode(node.children, node[indexSymbol]),
        }
      }
      return node
    })
    .concat({
      type: NODE_TYPE_ADD,
      key: 'add_' + uuid(),
      [indexSymbol]: parentIndex ? `${parentIndex}-${treeData.length}` : treeData.length.toString(),
    })
}
// Filter out the 'add' type nodes from the data.
const filterAdditionNode = (data: ITreeNode[]): ITreeNode[] => {
  const newData = [...data].filter((item) => item.type !== NODE_TYPE_ADD)
  return newData.map((item) => {
    if (Array.isArray(item.children)) {
      return {
        ...item,
        children: filterAdditionNode(item.children),
      }
    }
    return item
  })
}

const TreeDialog: React.FC<ITreeDialogProps> = ({
  value,
  visible,
  onClose,
  onConfirm,
  allowDrop,
  title,
  addButtonProps,
  initialValue,
  showEdit = () => true,
  showDelete = () => true,
  renderLabel,
  updateDataAfterDelete,
  preview,
}) => {
  const [treeData, setTreeData] = React.useState<ITreeNode[]>([])
  React.useEffect(() => {
    if (Array.isArray(value)) {
      setTreeData(insertAdditionNode(generateTreeNodeIndex(value)))
    }
  }, [value])
  const handleConfirm = useCallback(() => {
    onConfirm?.(filterAdditionNode(treeData))
  }, [treeData])
  const handleAdd = useCallback(
    (nodeIndex?: string) => {
      if (!nodeIndex) return
      const path = nodeIndex.split('-').slice(0, -1)
      const newTreeData = [...treeData]

      const p = path.reduce((acc, cur) => {
        return acc[cur].children
      }, newTreeData)
      const newItem = initialValue?.() || {
        title: 'New Item',
        key: 'item_' + uuid(),
      }
      if (!newItem.key) newItem.key = 'item_' + uuid()
      newItem.children = [
        {
          type: NODE_TYPE_ADD,
          key: 'add_' + uuid(),
        },
      ]
      p.splice(p.length - 1, 0, newItem)
      setTreeData(generateTreeNodeIndex(newTreeData))
    },
    [treeData],
  )

  const handleDrop = useCallback(
    ({
      dragNode,
      node,
      dropPosition,
      dropToGap,
    }: {
      dragNode: EventDataNode<any>
      node: EventDataNode<any>
      dropPosition: number
      dropToGap: boolean
    }) => {
      const dropKey = node.key as string
      const dragKey = dragNode.key as string
      const dropPos = node.pos.split('-')
      const position = dropPosition - Number(dropPos[dropPos.length - 1])
      let dragTreeData: ITreeNode
      const newTreeData = clone(treeData)
      handleTreeNodeByKey(newTreeData, dragKey, (parent, index, item) => {
        parent.splice(index, 1)
        dragTreeData = item
      })
      handleTreeNodeByKey(newTreeData, dropKey, (parent, index, item) => {
        if (!dropToGap || (position === 1 && node.expanded)) {
          if (!Array.isArray(item.children)) item.children = []
          item.children.unshift(dragTreeData)
        } else {
          if (dropPosition === -1) {
            parent.splice(index, 0, dragTreeData)
          } else {
            parent.splice(index + 1, 0, dragTreeData)
          }
        }
      })
      setTreeData(generateTreeNodeIndex(newTreeData))
    },
    [treeData],
  )
  const isDropAllowed = useCallback(
    (dropObj: any) => {
      const { dropNode, dropPosition } = dropObj
      if (dropNode.type === NODE_TYPE_ADD) {
        // can only drop in front of a 'add' node
        return dropPosition === -1
      }
      return allowDrop ? allowDrop(dropObj) : true
    },
    [allowDrop],
  )
  const handleDelete = useCallback(
    (node: ITreeNode) => {
      const newTreeData = clone(treeData)
      handleTreeNodeByKey(newTreeData, node.key, (parent, index, item) => {
        parent.splice(index, 1)
      })
      if (updateDataAfterDelete) {
        setTreeData(updateDataAfterDelete(filterAdditionNode(newTreeData)))
      } else {
        setTreeData(newTreeData)
      }
    },
    [treeData, updateDataAfterDelete],
  )
  const [editingNodeKey, setEditingNodeKey] = useState('')
  const handleEdit = useCallback((node: ITreeNode) => {
    setEditingNodeKey(node.key)
  }, [])
  const handleInput = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, node: ITreeNode) => {
      if (event.key === 'Enter') {
        const newTreeData = clone(treeData)
        handleTreeNodeByKey(newTreeData, node.key, (parent, index, item) => {
          item.title = (event.target as HTMLInputElement).value || ''
        })
        setTreeData(newTreeData)
        setEditingNodeKey('')
      } else if (event.key === 'Esc') {
        setEditingNodeKey('')
      }
    },
    [treeData],
  )
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      onCancel={onClose}
      onOk={handleConfirm}
      title={title || '树编辑'}
      closeable
    >
      <div
        style={{
          width: 800,
          height: 600,
          padding: 16,
          overflow: 'auto',
          border: '1px solid #e9e9e9',
        }}
      >
        <Tree
          treeData={treeData}
          defaultExpandAll
          showLine
          draggable={{
            icon: false,
            nodeDraggable: (node: any) => node.type !== NODE_TYPE_ADD,
          }}
          icon={(node: ITreeNode) => {
            if (node.type === NODE_TYPE_ADD) {
              return <Icon id="" />
            }
          }}
          allowDrop={isDropAllowed}
          onDrop={handleDrop}
          titleRender={(node: ITreeNode) => {
            if (node.type === NODE_TYPE_ADD) {
              return (
                <Button type="primary" text onClick={() => handleAdd(node[indexSymbol])}>
                  {addButtonProps?.text || 'Add a New Item'}
                </Button>
              )
            }
            return (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {editingNodeKey === node.key ? (
                  <Input
                    autoFocus
                    onKeyDown={(event) => handleInput(event, node)}
                    defaultValue={node.title}
                  />
                ) : (
                  <Typography.Text>{renderLabel ? renderLabel(node) : node.title}</Typography.Text>
                )}
                {!editingNodeKey && showEdit?.(node) && (
                  <Button text onClick={() => handleEdit(node)} style={{ marginLeft: 10 }}>
                    <Icon type="edit" />
                  </Button>
                )}
                {!editingNodeKey && showDelete?.(node) && (
                  <Button text onClick={() => handleDelete(node)} style={{ marginLeft: 10 }}>
                    <Icon type="ashbin" />
                  </Button>
                )}
              </div>
            )
          }}
        />
      </div>
      {preview && (
        <div
          style={{
            height: 200,
          }}
        >
          {preview(filterAdditionNode(treeData))}
        </div>
      )}
    </Dialog>
  )
}

const TreeSetter = (props: ITreeSetterProps) => {
  const { value, onChange, beforeDialogVisible, title, field, ...restProps } = props
  const [visible, setVisible] = React.useState(false)
  const handleConfirm = useCallback((data) => {
    onChange?.(data)
    setVisible(false)
  }, [])
  const handleClick = useCallback(() => {
    beforeDialogVisible?.()
    setVisible(true)
  }, [beforeDialogVisible])
  const titleText = React.useMemo(() => {
    if (title) return title
    const fieldTitle = field?.title
    if (!fieldTitle) return '设置'
    if (typeof fieldTitle === 'string') return fieldTitle
    if (isValidElement(fieldTitle)) return fieldTitle
    return fieldTitle.label
  }, [title, field])
  return (
    <>
      <Button type="primary" onClick={handleClick}>
        {titleText}
      </Button>
      {visible && (
        <TreeDialog
          {...restProps}
          title={title}
          visible
          value={value}
          onClose={() => setVisible(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}

// setter must be class component because of the issue below
// http://gitlab.alibaba-inc.com/ali-lowcode/ali-lowcode-engine/issues/109046
export default class extends Component<ITreeSetterProps> {
  render() {
    return <TreeSetter {...this.props} />
  }
}
