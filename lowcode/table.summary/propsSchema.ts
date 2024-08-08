import { FieldConfig } from '@alilc/lowcode-types'

const props: FieldConfig[] = [
  {
    name: 'fixed',
    title: {
      label: '是否固定',
      tip: 'fixed | 是否固定',
    },
    propType: 'bool',
    setter: 'BoolSetter',
  },
]
export default props
