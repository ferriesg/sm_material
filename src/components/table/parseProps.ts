import { ICustomTableProps } from './useTableColumns'

export const parseProps = (props: ICustomTableProps<any>) => {
  if (props.pagination) {
    //@ts-ignore
    props.pagination.position = [props.pagination.position]
  }
  return props
}
