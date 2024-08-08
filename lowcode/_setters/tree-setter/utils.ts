import { ITreeNode } from '.'

export const indexSymbol = Symbol('index')
export const generateTreeNodeIndex = (treeData: ITreeNode[], parentIndex?: string): ITreeNode[] => {
  return treeData.map((node, index) => {
    const nodeIndex = parentIndex ? `${parentIndex}-${index}` : `${index}`
    if (Array.isArray(node.children)) {
      const children = generateTreeNodeIndex(node.children, nodeIndex)
      return {
        ...node,
        [indexSymbol]: nodeIndex,
        children,
      }
    }
    return {
      ...node,
      [indexSymbol]: nodeIndex,
    }
  })
}

export const handleTreeNodeByKey = (
  treeData: ITreeNode[],
  nodeKey: string,
  callback?: (tree: ITreeNode[], index: number, node: ITreeNode) => void,
): boolean => {
  return !!treeData.find((node, index) => {
    if (node.key === nodeKey) {
      callback?.(treeData, index, node)
      return true
    }
    if (Array.isArray(node.children)) {
      return handleTreeNodeByKey(node.children, nodeKey, callback)
    }
    return false
  })
}

export function uuid() {
  return ((Math.random() * 1e6) >> 0).toString(36)
}
