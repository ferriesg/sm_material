import snippets from './snippets'
import { IPublicTypeComponentDescription } from '@redhare/lowcode-types'

const TableDescription: IPublicTypeComponentDescription = {
  snippets,
  componentName: 'SMTable.Summary.Row',
  title: '表格总结栏行',
  category: '数据展示',
  group: '双马',
  keywords: ['table'],
  configure: {
    props: [],
    component: { isContainer: true, nestingRule: { childWhitelist: ['SMTable.Summary.Cell'] } },
    supports: {
      style: true,
      className: true,
      events: [],
    },
  },
}

export default TableDescription
