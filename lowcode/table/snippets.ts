export default [
  {
    title: '表格',
    screenshot:
      'https://cdn.redhare.cc/rs/external/customer/1698/4373169_excel_logo_logos_icon.png',
    schema: {
      componentName: 'SMTable',
      props: {
        dataSource: [
          {
            id: 1,
            name: '王一',
            age: '10',
            gender: '男',
          },
          {
            id: 2,
            name: '王二',
            age: '9',
            gender: '男',
          },
        ],
        columns: [
          {
            title: '序号',
            dataIndex: 'id',
          },
          {
            title: '名字',
            dataIndex: 'name',
          },
          {
            title: '年龄',
            dataIndex: 'age',
          },
          {
            title: '性别',
            dataIndex: 'gender',
          },
        ],
        rowKey: 'id',
        pagination: {
          pageSize: 10,
          total: 2,
          current: 1,
        },
      },
    },
  },
]
