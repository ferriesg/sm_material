import snippets from './snippets'
import propsSchema from './propsSchema'
import {
  IPublicTypeComponentAutoConfigureSchema,
  IPublicTypeComponentDescription,
} from '@redhare/lowcode-types'

const TableDescription: IPublicTypeComponentDescription = {
  snippets,
  componentName: 'SMTable',
  title: '表格',
  category: '数据展示',
  group: '双马',
  keywords: ['table'],
  configure: {
    props: propsSchema,
    component: {
      autoConfigure: {
        title: '自动配置表格列',
        validate(schema: IPublicTypeComponentAutoConfigureSchema) {
          return (
            schema.type === 'array' &&
            !!schema.items &&
            (schema.items as IPublicTypeComponentAutoConfigureSchema).type === 'object'
          )
        },
        run(schema: IPublicTypeComponentAutoConfigureSchema, data: any) {
          const columns: any[] = []
          if (
            schema.type === 'array' &&
            schema.items &&
            (schema.items as IPublicTypeComponentAutoConfigureSchema).type === 'object'
          ) {
            const properties =
              (schema.items as IPublicTypeComponentAutoConfigureSchema).properties || {}
            Object.keys(properties).forEach((key) => {
              const property = properties[key]
              columns.push({
                dataIndex: key,
                title: key,
                render:
                  property.type === 'object'
                    ? {
                        type: 'JSSlot',
                        params: ['text', 'record', 'index'],
                        value: [],
                      }
                    : undefined,
              })
            })
          }

          return { props: { columns, dataSource: data } }
        },
      },
    },
    supports: {
      style: true,
      className: true,
      events: [
        {
          name: 'onChange',
          description:
            "onChange(pagination,filters,sorter,extra,${extParams}){\n// 表格翻页事件\nconsole.log('onChange', pagination);}",
        },
        {
          name: 'onColumnsSort',
          description:
            "onColumnsSort(columnsOrder){\n// 表格列拖拽排序事件\nconsole.log('columnsOrder', columnsOrder);}",
        },
        {
          name: 'onColumnsResize',
          description:
            "onColumnsResize(columnsWidth){\n// 表格列拖拽宽度事件\nconsole.log('columnsWidth', columnsWidth);}",
        },
        {
          name: 'rowSelection.onChange',
          description:
            "onRowSelectionChange(selectedRowKeys,selectedRows,${extParams}){\n// 选中项发生变化时的回调\nconsole.log('onRowSelectionChange', selectedRowKeys, selectedRows);}",
        },
        {
          name:'onRowsSort',
          description:
            "onRowsSort(rowsData){\n// 表格行排序事件\nconsole.log('rowsOrder', rowsOrder);}",
        },
        {
          name: 'expandable.onExpand',
          description:
            "onExpandableExpand(expanded,record){\n// 点击展开图标时触发\nconsole.log('onRowSelectionChange', expanded, record);}",
        },
      ],
    },
  },
}

export default TableDescription
