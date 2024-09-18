import TableHeaderGroupsSetter from '../../lowcode/_setters/tree-setter/TableHeaderGroupsSetter'
import { FieldConfig, SettingTarget } from '@alilc/lowcode-types'
import { uuid } from '../_utils/utils'

const isShowPagination = (target: SettingTarget) => !!target.parent.getPropValue('pagination')

const isShowRowSelection = (target: SettingTarget) => !!target.parent.getPropValue('rowSelection')
const isMultipleSelect = (target: SettingTarget) => {
  const rowSelection = target.parent.getPropValue('rowSelection')
  return rowSelection?.type === 'checkbox'
}

const props: FieldConfig[] = [
  {
    title: '基础设置',
    display: 'accordion',
    type: 'group',
    items: [
      {
        name: 'dataSource',
        title: { label: 'JSON格式的数据', tip: 'dataSource | 表格数据' },
        setter: 'JsonSetter',
        supportVariable: true,
      },
      {
        name: 'rowKey',
        title: {
          label: '每行数据唯一key(建议使用id)',
          tip: 'rowKey | 表格行 key 的取值，可以是字符串或一个函数',
        },
        setter: [
          {
            componentName: 'StringSetter',
          },
          {
            componentName: 'FunctionSetter',
            props: {
              template:
                'getRowKey(record,${extParams}){\n// 通过函数获取表格行 key\nreturn record.id;\n}',
            },
          },
        ],
        supportVariable: true,
        defaultValue: 'id',
      },
      {
        name: 'emptyText',
        title: {
          label: '空数据时提示文字',
          tip: '数据源为空时展示的文本',
        },
        setter: 'StringSetter',
      },
      {
        name: 'scrollTo',
        title: {
          label: '默认滚动定位到第几条数据',
          tip: 'scrollTo | 比如可视区只能看到10条数据，但希望初始化看到第11条，此处设置',
        },
        setter: 'NumberSetter',
      },
    ],
  },
  {
    name: 'tableHeadEdit',
    title: '配置表格列', // 表头编辑
    display: 'block',
    type: 'group',
    items: [
      // {
      //   name: 'headerGroups',
      //   title: {
      //     label: '列头设置、列分组',
      //     tip: '表头编辑后，部分表格列配置中的选项会被覆盖。',
      //   },
      //   setter: {
      //     componentName: TableHeaderGroupsSetter,
      //     props: {
      //       columns: {
      //         type: 'JSFunction',
      //         value: 'target => target.getProps().getPropValue("columns")',
      //       },
      //     },
      //   },
      // },
      {
        name: 'columns',
        title: { label: '表格列', tip: '表格列的配置描述，具体项见下表' },
        setter: {
          componentName: 'ArraySetter',
          props: {
            itemSetter: {
              componentName: 'ObjectSetter',
              props: {
                config: {
                  items: [
                    {
                      name: 'title',
                      title: { label: '列标题', tip: 'title | 列标题' },
                      propType: { type: 'oneOfType', value: ['string', 'func'] },
                      setter: [
                        'StringSetter',
                        {
                          componentName: 'SlotSetter',
                          title: '列标题插槽',
                          initialValue: {
                            type: 'JSSlot',
                            params: ['options'],
                            value: [],
                          },
                        },
                      ],
                      important: true,
                    },
                    {
                      name: 'dataIndex',
                      title: { label: '数据字段', tip: 'dataIndex | 数据字段' },
                      propType: 'string',
                      setter: 'StringSetter',
                      isRequired: true,
                    },
                    {
                      name: 'key',
                      title: { label: 'React key', tip: 'key | React需要的key' },
                      propType: 'string',
                      setter: 'StringSetter',
                    },
                    {
                      name: 'align',
                      title: { label: '对齐方式', tip: 'align | 对齐方式' },
                      propType: {
                        type: 'oneOf',
                        value: ['left', 'right', 'center'],
                      },
                      defaultValue: 'left',
                      setter: [
                        {
                          componentName: 'RadioGroupSetter',
                          props: {
                            options: [
                              {
                                title: 'left',
                                value: 'left',
                              },
                              {
                                title: 'right',
                                value: 'right',
                              },
                              {
                                title: 'center',
                                value: 'center',
                              },
                            ],
                          },
                        },
                      ],
                    },
                    {
                      name: 'fixed',
                      title: { label: '列是否固定', tip: 'fixed | 列是否固定' },
                      description: '（IE 下无效）列是否固定，可选 true (等效于 left) left right',
                      defaultValue: '',
                      propType: {
                        type: 'oneOf',
                        value: ['', 'left', 'right'],
                      },
                      setter: [
                        {
                          componentName: 'RadioGroupSetter',
                          props: {
                            options: [
                              {
                                title: '不固定',
                                value: '',
                              },
                              {
                                title: '固定在左侧',
                                value: 'left',
                              },
                              {
                                title: '固定在右侧',
                                value: 'right',
                              },
                            ],
                          },
                        },
                      ],
                    },
                    {
                      name: 'className',
                      title: {
                        label: '列样式类名',
                        tip: 'className | 列样式类名',
                      },
                      propType: 'string',
                      setter: 'StringSetter',
                    },
                    {
                      name: 'width',
                      title: { label: '宽度', tip: 'width | 宽度' },
                      propType: {
                        type: 'oneOfType',
                        value: ['number', 'string'],
                      },
                      setter: ['NumberSetter', 'StringSetter', 'VariableSetter'],
                    },
                    {
                      name: 'ellipsisWidth',
                      title: '行超过该宽，使用省略号',
                      propType: 'number',
                      setter: 'NumberSetter',
                    },
                    {
                      name: 'sorter',
                      title: {
                        label: '设置排序规则',
                        tip: 'sorter | 排序函数，本地排序使用一个函数，需要服务端排序可设为 true',
                      },
                      propType: { type: 'oneOfType', value: ['bool', 'func'] },
                      setter: ['BoolSetter', 'FunctionSetter', 'VariableSetter'],
                    },
                    {
                      name: 'hidden',
                      title: {
                        label: '是否隐藏',
                        tip: 'hidden | 是否隐藏当前列',
                      },
                      propType: 'bool',
                      setter: 'BoolSetter',
                    },
                    {
                      name: 'filterType',
                      title: {
                        label: '表格列筛选',
                        tip: '表格列筛选',
                      },
                      propType: 'string',
                      setter: {
                        componentName: 'RadioGroupSetter',
                        props: {
                          options: [
                            {
                              title: '关闭',
                              value: 'off',
                            },
                            {
                              title: '默认',
                              value: 'default',
                            },
                            {
                              title: '自定义',
                              value: 'custom',
                            },
                          ],
                        },
                      },
                      defaultValue: 'off',
                    },
                    {
                      name: 'filters',
                      title: {
                        label: '筛选菜单项',
                        tip: 'filters | 表头的筛选菜单项',
                      },
                      propType: 'object',
                      setter: 'JsonSetter',
                      condition(target) {
                        // 仪表盘样式无效
                        return target.getParent().getPropValue('filterType') === 'custom'
                      },
                    },
                    {
                      name: 'onFilter',
                      title: {
                        label: '筛选方法',
                        tip: '筛选项变化时调用，参数分别为${value, record}',
                      },
                      setter: 'FunctionSetter',
                      condition(target) {
                        // 仪表盘样式无效
                        return target.getParent().getPropValue('filterType') === 'custom'
                      },
                    },
                    {
                      name: 'colSpan',
                      title: {
                        label: '表头列合并，设置为 0 时，不渲染', // TODO: label change to 合并表头, type change to BooleanSetter
                        tip: '默认为1，设置为0则不展示该表头。',
                      },
                      setter: {
                        componentName: 'NumberSetter',
                        props: {
                          default: 1,
                        },
                      },
                    },
                    {
                      name: 'onCell',
                      title: {
                        label: '行/列合并',
                        tip: '打开开关将使用默认的依据(根据相邻行的内容是否相同)进行合并，如果需要自定义合并方法，请绑定函数',
                      },
                      propType: { type: 'oneOfType', value: ['bool', 'func'] },
                      setter: [
                        'BoolSetter',
                        {
                          componentName: 'FunctionSetter',
                          props: {
                            // TODO: fix template not effect
                            // @shawn.xiao
                            template:
                              'onCell(record, text, data){\n// 自定义rowSpan\nreturn { rowSpan: ${number} };\n}',
                          },
                        },
                      ],
                    },
                    {
                      name: 'render',
                      title: {
                        label: '自定义渲染',
                        tip: 'render | 插槽内的物料表达式可通过this.record获取当前行数据，this.index获取索引',
                      },
                      propType: 'func',
                      setter: [
                        {
                          componentName: 'SlotSetter',
                          title: '单元格插槽',
                          initialValue: {
                            type: 'JSSlot',
                            params: ['text', 'record', 'index'],
                            value: [],
                          },
                        },
                      ],
                      supportVariable: true,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        name: 'columnsDraggable',
        title: {
          label: '列拖拽排序',
          tip: '设置了数据字段（dataIndex），且非固定列（fixed未配置）的列可以进行拖拽排序',
        },
        setter: {
          componentName: 'BoolSetter',
          isRequired: true,
          initialValue: '',
        },
      },
      {
        name: 'rowsDraggable',
        title: {
          label: '行拖拽排序',
          tip: '设置了数据字段（dataIndex），且非固定列（fixed未配置）的列可以进行拖拽排序',
        },
        setter: {
          componentName: 'BoolSetter',
          isRequired: true,
          initialValue: '',
        },
      },
      {
        name: 'id',
        title: {
          label: '表格ID',
        },
        setter: 'StringSetter',
        condition: (target: SettingTarget) => !!target.parent.getPropValue('columnsDraggable'),
        defaultValue: `table_${uuid()}`,
      },
      {
        name: 'recordColumnsOrder',
        title: {
          label: '记住列顺序',
          tip: '是否记住修改后的列顺序',
        },
        setter: 'BoolSetter',
        condition: (target: SettingTarget) => !!target.parent.getPropValue('columnsDraggable'),
      },
      {
        name: 'allAlign',
        title: { label: '一键对齐', tip: '所有表格列对齐方式都会统一设置' },
        propType: {
          type: 'oneOf',
          value: ['left', 'right', 'center'],
        },
        defaultValue: 'left',
        setter: [
          {
            componentName: 'RadioGroupSetter',
            props: {
              options: [
                {
                  title: 'left',
                  value: 'left',
                },
                {
                  title: 'right',
                  value: 'right',
                },
                {
                  title: 'center',
                  value: 'center',
                },
              ],
            },
          },
        ],
        extraProps: {
          setValue: (target, value, context) => {
            const columns = target.parent.getPropValue('columns')
            if (Array.isArray(columns)) {
              const updatedColumns = columns.map((column) => ({
                ...column,
                align: value,
              }))
              target.parent.setPropValue('columns', updatedColumns)
            }
          },
        },
      },
    ],
  },
  {
    title: '外观（更丰富的外观可在“样式”中修改）',
    display: 'block',
    type: 'group',
    items: [
      {
        name: 'size',
        title: { label: '表格大小', tip: 'size | 表格大小' },
        setter: [
          {
            componentName: 'RadioGroupSetter',
            props: {
              options: [
                {
                  title: '默认',
                  value: 'default',
                },
                {
                  title: '中',
                  value: 'middle',
                },
                {
                  title: '小',
                  value: 'small',
                },
              ],
            },
          },
        ],
        supportVariable: true,
        defaultValue: 'default',
      },
      {
        name: 'tableLayout',
        title: { label: '表格布局', tip: 'tableLayout | 表格布局' },
        defaultValue: '',
        setter: [
          {
            componentName: 'RadioGroupSetter',
            props: {
              options: [
                {
                  title: '默认',
                  value: '',
                },
                {
                  title: '自动',
                  value: 'auto',
                },
                {
                  title: '固定',
                  value: 'fixed',
                },
              ],
            },
          },
        ],
        supportVariable: true,
      },
      {
        name: 'showHeader',
        title: { label: '显示表头', tip: 'showHeader | 是否显示表头' },
        setter: 'BoolSetter',
        defaultValue: true,
      },
      {
        name: 'bordered',
        title: {
          label: '显示边框',
          tip: 'bordered | 是否展示外边框和列边框',
        },
        setter: 'BoolSetter',
      },
      {
        name: 'loading',
        title: { label: '显示加载等待loading', tip: 'loading | 是否加载中' },
        setter: 'BoolSetter',
        defaultValue: false,
        supportVariable: true,
      },
      {
        name: 'title',
        title: { label: '显示标题', tip: 'title | 表格标题' },
        setter: [
          {
            componentName: 'SlotSetter',
            title: '表格标题插槽',
            initialValue: {
              type: 'JSSlot',
              params: ['currentPageData'],
              value: [],
            },
          },
          {
            componentName: 'FunctionSetter',
            props: {
              template:
                'renderTitle(currentPageData,${extParams}){\n// 自定义渲染表格顶部\nreturn "表格顶部";\n}',
            },
          },
        ],
        supportVariable: true,
      },
      {
        name: 'summary',
        title: { label: '显示总结', tip: 'summary | 总结栏' },
        setter: [
          {
            componentName: 'SlotSetter',
            title: '总结栏插槽',
            initialValue: {
              type: 'JSSlot',
              params: ['pageData'],
              value: {
                componentName: 'SMTable.Summary.Row',
                children: [
                  {
                    componentName: 'SMTable.Summary.Cell',
                    props: {
                      children: '总计1',
                    },
                  },
                  {
                    componentName: 'SMTable.Summary.Cell',
                    props: {
                      children: '总计2',
                    },
                  },
                ],
              },
            },
          },
          {
            componentName: 'FunctionSetter',
            props: {
              template:
                'renderSummary(currentPageData,${extParams}){\n// 自定义渲染表格总结\nreturn ReactNode;\n}',
            },
          },
        ],
        supportVariable: true,
      },
      {
        name: 'footer',
        title: { label: '显示尾部', tip: 'footer | 表格尾部' },
        setter: [
          {
            componentName: 'SlotSetter',
            title: '表格尾部插槽',
            initialValue: {
              type: 'JSSlot',
              params: ['currentPageData'],
              value: [],
            },
          },
          {
            componentName: 'FunctionSetter',
            props: {
              template:
                'renderFooter(currentPageData,${extParams}){\n// 自定义渲染表格尾部\nreturn "表格尾部";\n}',
            },
          },
        ],
        supportVariable: true,
      },
      {
        name: 'paginationGroup',
        title: '分页相关',
        type: 'group',
        display: 'accordion',
        items: [
          {
            name: 'pagination',
            title: { label: '显示分页', tip: 'pagination | 显示分页' },
            setter: 'BoolSetter',
            extraProps: {
              setValue: (target, value) => {
                if (value) {
                  target.parent.setPropValue('pagination', {
                    pageSize: 10,
                  })
                }
              },
            },
          },
          {
            name: 'pagination.pageSize',
            title: { label: '分页时每页多少条', tip: 'pagination.pageSize | 每页条数' },
            setter: 'NumberSetter',
            condition: isShowPagination,
          },
          {
            name: 'pagination.total',
            title: {
              label: '总数量（用于计算共计多少页）',
              tip: 'pagination.total | 只用于计算共计多少页，不会直接展示总数量',
            },
            setter: 'NumberSetter',
            condition: isShowPagination,
          },
          {
            name: 'pagination.showTotal',
            title: {
              label: '显示总数量（需要是个函数，参考tips提示）',
              tip: 'pagination.showTotal | 比如直接显示总数：(total) => {return total}',
            },
            setter: [
              {
                componentName: 'FunctionSetter',
                props: {
                  template:
                    'showTotal(total,range,${extParams}){\n// 用于格式化显示表格数据总量\nreturn `共 ${total} 条`;\n}',
                },
              },
            ],
            supportVariable: true,
            condition: isShowPagination,
          },
          {
            name: 'pagination.defaultCurrent',
            title: {
              label: '每次进来默认第几页',
              tip: 'pagination.defaultCurrent | 默认的当前页数',
            },
            setter: 'NumberSetter',
            condition: isShowPagination,
          },
          {
            name: 'pagination.current',
            title: { label: '当前第几页', tip: 'pagination.current | 当前页数' },
            setter: 'NumberSetter',
            condition: isShowPagination,
          },
          {
            name: 'pagination.pageSizeOptions',
            title: {
              label: '可选分页数',
              tip: 'pageSizeOptions | 指定 pageSize切换器 可选择的每页条数',
            },
            propType: 'object',
            setter: 'JsonSetter',
            condition: isShowPagination,
          },
          {
            name: 'pagination.showSizeChanger',
            title: {
              label: '页数切换',
              tip: 'pagination.showSizeChanger | 是否展示 pageSize 切换器',
            },
            setter: 'BoolSetter',
            defaultValue: true,
            condition: isShowPagination,
          },
          {
            name: 'pagination.showQuickJumper',
            title: {
              label: '快速跳转',
              tip: 'pagination.showQuickJumper | 是否可以快速跳转至某页',
            },
            setter: 'BoolSetter',
            defaultValue: false,
            condition: isShowPagination,
          },
          {
            name: 'pagination.simple',
            title: { label: '简单分页', tip: 'pagination.simple | 简单分页' },
            setter: 'BoolSetter',
            defaultValue: false,
            condition: isShowPagination,
          },
          {
            name: 'pagination.size',
            title: { label: '分页尺寸', tip: 'pagination.size | 分页尺寸' },
            setter: [
              {
                componentName: 'RadioGroupSetter',
                props: {
                  options: [
                    {
                      title: '默认',
                      value: 'default',
                    },
                    {
                      title: '小',
                      value: 'small',
                    },
                  ],
                },
              },
            ],
            defaultValue: 'default',
            supportVariable: true,
            condition: isShowPagination,
          },
          {
            name: 'pagination.position',
            title: { label: '分页位置', tip: 'pagination.position | 分页位置' },
            setter: {
              componentName: 'SelectSetter',
              initialValue: 'bottomRight',
              props: {
                options: [
                  {
                    title: '上左',
                    value: 'topLeft',
                  },
                  {
                    title: '上中',
                    value: 'topCenter',
                  },
                  {
                    title: '上右',
                    value: 'topRight',
                  },
                  {
                    title: '下左',
                    value: 'bottomLeft',
                  },
                  {
                    title: '下中',
                    value: 'bottomCenter',
                  },
                  {
                    title: '下右',
                    value: 'bottomRight',
                  },
                ],
              },
            },
            condition: isShowPagination,
          },
        ],
      },
      {
        name: 'scrollGroup',
        title: '表格指定区域滚动',
        display: 'accordion',
        type: 'group',
        items: [
          {
            name: 'scroll.scrollToFirstRowOnChange',
            title: {
              label: '自动滚动',
              tip: 'scroll.scrollToFirstRowOnChange | 是否自动滚动到表格顶部',
            },
            setter: 'BoolSetter',
            defaultValue: true,
          },
          {
            name: 'scroll.x',
            title: {
              label: '横向滚动',
              tip: 'scroll.x | 	设置横向滚动，也可用于指定滚动区域的宽，可以设置为像素值，百分比，true 和 max-content',
            },
            setter: [
              {
                componentName: 'BoolSetter',
              },
              {
                componentName: 'NumberSetter',
              },
              {
                componentName: 'StringSetter',
              },
              {
                componentName: 'VariableSetter',
              },
            ],
            defaultValue: true,
          },
          {
            name: 'scroll.y',
            title: {
              label: '纵向滚动高度设置',
              tip: 'scroll.y | 	设置纵向滚动，也可用于指定滚动区域的高，可以设置为像素值',
            },

            setter: [
              {
                componentName: 'NumberSetter',
              },
              {
                componentName: 'VariableSetter',
              },
            ],
          },
        ],
      },
      {
        name: 'rowSelectionGroup',
        title: '表格行是否可选中',
        display: 'accordion',
        type: 'group',
        items: [
          {
            name: 'rowSelection',
            title: { label: '是否可选中', tip: 'rowSelection | 行选择' },
            setter: 'BoolSetter',
            defaultValue: false,
            extraProps: {
              setValue: (target, value) => {
                if (value) {
                  target.parent.setPropValue('rowSelection', {
                    type: 'radio',
                  })
                }
              },
            },
          },
          {
            name: 'rowSelection.type',
            title: { label: '行选择类型', tip: 'rowSelection.type | 多选/单选' },
            setter: [
              {
                componentName: 'RadioGroupSetter',
                props: {
                  options: [
                    {
                      title: '多选',
                      value: 'checkbox',
                    },
                    {
                      title: '单选',
                      value: 'radio',
                    },
                  ],
                },
              },
            ],
            supportVariable: true,
            condition: isShowRowSelection,
          },
          {
            name: 'rowSelection.hideSelectAll',
            title: { label: '隐藏全选勾选框', tip: 'rowSelection.hideSelectAll | 隐藏全选勾选框' },
            setter: 'BoolSetter',
            condition: isMultipleSelect,
          },
          {
            name: 'rowSelection.fixed',
            title: {
              label: '固定左边',
              tip: 'rowSelection.fixed | 把选择框列固定在左边',
            },
            setter: 'BoolSetter',
            condition: isShowRowSelection,
          },
          {
            name: 'rowSelection.selectedRowKeys',
            title: {
              label: '选中行Key',
              tip: 'rowSelection.selectedRowKeys | 指定选中项的 key 数组',
            },
            setter: 'JsonSetter',
            condition: isShowRowSelection,
          },
          {
            name: 'rowSelection.preserveSelectedRowKeys',
            title: {
              label: '保留选项',
              tip: 'rowSelection.preserveSelectedRowKeys | 当数据被删除时仍然保留选项',
            },
            setter: 'BoolSetter',
            condition: isShowRowSelection,
          },
          {
            name: 'rowSelection.getCheckboxProps',
            title: {
              label: '默认属性',
              tip: 'rowSelection.getCheckboxProps | 选择框的默认属性配置',
            },
            setter: [
              {
                componentName: 'FunctionSetter',
                props: {
                  template:
                    'getCheckboxProps(record,${extParams}){\n// 选择框的默认属性配置\nreturn { disabled: false };\n}',
                },
              },
            ],
            supportVariable: true,
            condition: isShowRowSelection,
          },
        ],
      },
      {
        name: 'expandable',
        title: '设置每行展开',
        display: 'accordion',
        type: 'group',
        items: [
          {
            name: 'expandable.childrenColumnName',
            title: {
              label: '数据含有该字段默认有展开属性',
            },
            setter: 'StringSetter',
          },
          {
            name: 'expandable.expandedRowRender',
            title: {
              label: '展开行渲染',
              tip: 'expandable.expandedRowRender | 额外的展开行',
            },
            setter: [
              {
                componentName: 'SlotSetter',
                title: '展开行插槽',
                initialValue: {
                  type: 'JSSlot',
                  params: ['record', 'index', 'indent', 'expanded'],
                  value: [],
                },
              },
              {
                componentName: 'FunctionSetter',
                props: {
                  template:
                    'expandedRowRender(record,index,indent,expanded,${extParams}){\n// 展开行渲染\nreturn `${record.id}`}',
                },
              },
            ],
            supportVariable: true,
          },
          {
            name: 'expandable.rowExpandable',
            title: {
              label: '是否可展开',
              tip: 'expandable.rowExpandable | 行是否可展开',
            },
            setter: [
              {
                componentName: 'FunctionSetter',
                props: {
                  template: 'rowExpandable(record,${extParams}){\n// 行是否可展开\nreturn true;\n}',
                },
              },
            ],
            supportVariable: true,
          },
        ],
      },
    ],
  },
  {
    name: 'extend',
    title: '扩展',
    display: 'block',
    type: 'group',
    items: [
      {
        name: 'onHeaderRow',
        title: { label: '头部行属性', tip: 'onHeaderRow | 设置头部行属性' },
        setter: [
          {
            componentName: 'FunctionSetter',
            props: {
              template:
                'onHeaderRow(columns,index,${extParams}){\n// 设置头部行属性\nreturn {onClick:()=>{}};\n}',
            },
          },
        ],
        supportVariable: true,
      },
      {
        name: 'onRow',
        title: { label: '行属性', tip: 'onRow | 设置行属性' },
        setter: [
          {
            componentName: 'FunctionSetter',
            props: {
              template:
                'onRow(record,index,${extParams}){\n// 设置行属性\nreturn {onClick:event=>{}};\n}',
            },
          },
        ],
        supportVariable: true,
      },
      {
        name: 'rowClassName',
        title: { label: '行类名', tip: 'rowClassName | 表格行的类名' },
        setter: [
          {
            componentName: 'FunctionSetter',
            props: {
              template:
                'rowClassName(record,index,${extParams}){\n// 表格行的类名\nreturn `className-${record.type}`;\n}',
            },
          },
        ],
        supportVariable: true,
      },
    ],
  },
]
export default props
