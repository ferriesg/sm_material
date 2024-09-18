import "./style.scss";
import React, { createElement, useRef, useEffect, useState } from "react";
import { Table as OriginalTable, Empty } from "antd";
import { ColumnsType } from "antd/lib/table";
import { isNil } from "lodash";
import Sortable from "sortablejs";
import useTableColumns, {
  getTableColumnOrderStorageId,
  ICustomTableProps,
  useColumnsOrder,
} from "./useTableColumns";
import { HolderOutlined } from "@ant-design/icons";
import resetChildrenName from "./resetDefaultChildrenName";
import { ColumnType, TableLocale } from "antd/lib/table/interface";
import { parseProps } from "./parseProps";

const setEllipsisColumns = (columns: any): ColumnsType<any> => {
  if (isNil(columns)) {
    return columns;
  }

  columns = columns.map((item) => {
    return item.ellipsisWidth && !item.render
      ? {
          ...item,
          ellipsis: true,
          render: (text) => (
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: `${item.ellipsisWidth}px`,
              }}
            >
              {text}
            </div>
          ),
        }
      : item;
  });
  return columns as any;
};

const useTableLocale = (emptyText?: string): TableLocale => {
  if (emptyText) {
    return {
      emptyText: (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
      ),
    };
  }
  return {};
};

const SMTable = (props: ICustomTableProps<any>) => {
  const newProps = parseProps(props);
  const [columnsOrder, setColumnsOrder] = useColumnsOrder(
    props.columnsDraggable,
    props.id,
    props.recordColumnsOrder
  );
  let columns = useTableColumns(newProps, columnsOrder);
  columns = setEllipsisColumns(columns);
  
  const {
    scrollTo,
    ellipsisWidth,
    emptyText,
    id,
    columnsDraggable,
    rowsDraggable,
    recordColumnsOrder,
    ...restProps
  } = newProps;
  if(rowsDraggable) columns = [{
    title: "",
    dataIndex: "icon",
    key: "icon",
    width:'10px',
    className: "row-draggable", // 让该列可拖动
    render: () => 
    <span className="drag-handle" style={{cursor:'pointer'}}><HolderOutlined/></span>, // 图标展示
  },...columns]
  const locale = useTableLocale(emptyText);
  const tableRef = useRef(null);

  useEffect(() => {
    tableRef?.current.scrollTo({ index: scrollTo });
  }, []);

  useEffect(() => {
    if(!rowsDraggable) return;
    const tableBody = document.querySelector(".ant-table-tbody");
    if (tableBody) {
      Sortable.create(tableBody, {
        handle: ".drag-handle",
        animation: 150,
        onEnd: (event) => {
          const newData = [...newProps.dataSource];
          const [movedItem] = newData.splice(event.oldIndex - 1, 1);
          newData.splice(event.newIndex - 1, 0, movedItem);
          props.onRowsSort(newData)
        },
      });
    }
  }, [newProps.dataSource,rowsDraggable]);

  useEffect(() => {
    let sorterHandler: { destroy: () => void } | undefined = undefined;
    if (columnsDraggable && id) {
      let columnsRef = columns as ColumnType<{}>[];
      const tableHeader = document
        .querySelector(`#${id}`)
        .querySelector(".ant-table-thead tr");
      sorterHandler = Sortable.create(tableHeader, {
        draggable: ".th-draggable",
        animation: 180,
        delay: 0,
        onEnd: (event: any) => {
          const columnTitleEl = event.item;
          const columnDraggableTitle = columnTitleEl.querySelector(
            ".th-draggable-title"
          );
          const dataIndex = columnDraggableTitle?.dataset.columnDataIndex;
          if (dataIndex) {
            const oldIndex = columnsRef.findIndex(
              (column) => column.dataIndex === dataIndex
            );
            // 支持选择或者行展开时，会增加几个列，index会偏移
            const offset = event.oldIndex - oldIndex;
            const newIndex = event.newIndex - offset;
            const oldColumn = columnsRef[oldIndex];
            columnsRef[oldIndex] = columnsRef[newIndex];
            columnsRef[newIndex] = oldColumn;
            setColumnsOrder(columnsRef.map((column) => column.dataIndex));
            props.onColumnsSort?.([...columnsRef] as any);
            if (recordColumnsOrder) {
              localStorage.setItem(
                getTableColumnOrderStorageId(id),
                JSON.stringify(
                  columnsRef
                    .map((item) => (item as any).dataIndex)
                    .filter(Boolean)
                )
              );
            }
          }
        },
      });
    }
    return () => sorterHandler?.destroy?.();
  }, [columnsDraggable, id, recordColumnsOrder, columns]);

  const newRestProps = resetChildrenName(restProps);
  return (
    <>
      <OriginalTable
        id={id}
        {...newRestProps}
        columns={columns}
        ref={tableRef}
        locale={locale}
      />
    </>
  );
};

SMTable.Summary = OriginalTable.Summary;

export default SMTable;
