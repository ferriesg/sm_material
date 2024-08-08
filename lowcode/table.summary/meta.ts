import snippets from './snippets'
import propsSchema from './propsSchema'
import { IPublicTypeComponentDescription } from '@redhare/lowcode-types'

const TableDescription: IPublicTypeComponentDescription = {
  snippets,
  componentName: 'SMTable.Summary',
  title: '表格总结栏',
  category: '数据展示',
  group: '双马',
  keywords: ['table'],
  configure: {
    props: propsSchema,
    component: { isContainer: true, nestingRule: { childWhitelist: ['SMTable.Summary.Row'] } },
    supports: {
      style: true,
      className: true,
      events: [],
    },
  },
}

export default TableDescription
