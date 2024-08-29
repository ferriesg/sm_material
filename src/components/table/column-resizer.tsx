import React from 'react'

interface IColumnResizerProps {
  onResize: (width: number) => void
}

const findTableHead = (el: HTMLElement) => {
  if (el.tagName === 'THEAD') {
    return el
  }
  return findTableHead(el.parentElement as HTMLElement)
}

export const ColumnResizer = (props: IColumnResizerProps) => {
  const { onResize } = props
  const resizerRef = React.useRef<HTMLDivElement>(null)
  const resizerShadowRef = React.useRef<HTMLDivElement>(null)
  const startX = React.useRef(0)
  const currentX = React.useRef(0)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    const { clientX } = e
    startX.current = clientX
    console.log('startX',clientX)

    const th = findTableHead(e.target as HTMLElement)

    const handleMouseMove = (e: MouseEvent) => {
      e.stopPropagation()
      const { clientX } = e
      currentX.current = clientX
      console.log('currentX',clientX)
      resizerShadowRef.current.style.left = `${currentX.current - startX.current}px`
    }

    const handleMouseUp = (e: MouseEvent) => {
      // 获取resizerRef parent节点的宽度
      e.stopPropagation()
      const parentWidth = resizerRef.current?.parentElement?.clientWidth || 0
      const diff = currentX.current - startX.current
      console.log('diff',diff)
      const newWidth = parentWidth + diff
      console.log('newWidth',parentWidth,resizerRef.current?.parentElement)
      console.log('newWidth',newWidth)
      startX.current = 0
      currentX.current = 0
      resizerShadowRef.current.style.left = '0px'
      th.removeEventListener('mousemove', handleMouseMove)
      th.removeEventListener('mouseup', handleMouseUp)
      onResize(newWidth<80?80:newWidth)
      console.log("%c Line:44 🍐 newWidth", "color:#ffdd4d", newWidth);
    }

    th.addEventListener('mousemove', handleMouseMove)
    th.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="th-col-resize-dragger" onMouseDown={handleMouseDown} ref={resizerRef} onClick={(e)=>{
      e.stopPropagation()
    }}>
      <div ref={resizerShadowRef} className="th-col-resize-dragger-shadow" />
    </div>
  )
}
