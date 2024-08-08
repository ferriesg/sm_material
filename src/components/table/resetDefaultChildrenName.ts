const resetChildrenName = (props: any) => {
  if (!props?.expandable?.childrenColumnName) {
    if (props?.expandable) {
      props.expandable.childrenColumnName = '!QAZ@WSX#' // 随便设置一个不易冲突的columnname，如果没空,antd默认是children，这容易跟业务冲突。
    } else {
      props.expandable = {
        childrenColumnName: '!QAZ@WSX#', // 随便设置一个不易冲突的columnname，如果没空,antd默认是children，这容易跟业务冲突。
      }
    }
  }
  return props
}

export default resetChildrenName
