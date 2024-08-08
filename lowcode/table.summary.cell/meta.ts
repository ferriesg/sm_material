import snippets from './snippets'
import { IPublicTypeComponentDescription } from '@redhare/lowcode-types'

const TableDescription: IPublicTypeComponentDescription = {
  snippets,
  componentName: 'SMTable.Summary.Cell',
  title: '表格总结栏列',
  category: '数据展示',
  group: '双马',
  keywords: ['table'],
  configure: {
    props: [
      {
        name: 'index',
        title: {
          label: '第几列',
          tip: 'index | 列索引，第几列，从0开始',
        },
        propType: 'number',
        setter: 'NumberSetter',
      },
      {
        name: 'colSpan',
        title: {
          label: '横跨几列',
          tip: 'colSpan | 横跨几列',
        },
        propType: 'number',
        setter: 'NumberSetter',
      },
      {
        name: 'children',
        title: {
          label: '单元格内容',
          tip: 'children | 单元格内容',
        },
        setter: ['StringSetter', 'SlotSetter'],
      },
    ],
    component: { isContainer: true, nestingRule: { parentWhitelist: ['SMTable.Summary.Row'] } },
    supports: {
      style: true,
      className: true,
      events: [],
    },
  },
}

export default TableDescription
