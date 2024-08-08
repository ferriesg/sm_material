export default [
  {
    title: '表格总结栏行',
    screenshot:
      'https://cdn.redhare.cc/rs/external/customer/1698/4373169_excel_logo_logos_icon.png',
    schema: {
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
]
