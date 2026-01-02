import React from 'react'
import { cn } from '@/utils/cn'

export interface TableColumn<T = any> {
  key: keyof T | string
  title: string
  dataIndex?: keyof T
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

export interface TableProps<T = any> extends React.HTMLAttributes<HTMLTableElement> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyText?: string
  size?: 'sm' | 'md' | 'lg'
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  onRowClick?: (record: T, index: number) => void
}

const Table = <T extends Record<string, any>>({
  className,
  columns,
  data,
  loading = false,
  emptyText = 'No data available',
  size = 'md',
  striped = false,
  hoverable = false,
  bordered = false,
  onRowClick,
  ...props
}: TableProps<T>) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  }

  const cellPaddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }

  const getValue = (record: T, column: TableColumn<T>) => {
    if (column.render) {
      const dataIndex = column.dataIndex || (column.key as keyof T)
      return column.render(record[dataIndex], record, data.indexOf(record))
    }
    
    const dataIndex = column.dataIndex || (column.key as keyof T)
    return record[dataIndex]
  }

  const handleRowClick = (record: T, index: number) => {
    if (onRowClick) {
      onRowClick(record, index)
    }
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table
          className={cn(
            'w-full border-collapse',
            sizeClasses[size],
            bordered && 'border border-border',
            className
          )}
          {...props}
        >
          <thead>
            <tr className="bg-surface/50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'font-medium text-foreground text-left border-b border-border',
                    cellPaddingClasses[size],
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={cn(
                    'text-center text-muted-foreground border-b border-border',
                    cellPaddingClasses[size]
                  )}
                >
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-muted border-t-accent rounded-full animate-spin mr-2" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={cn(
                    'text-center text-muted-foreground border-b border-border',
                    cellPaddingClasses[size]
                  )}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'border-b border-border',
                    striped && rowIndex % 2 === 0 && 'bg-surface/25',
                    hoverable && 'hover:bg-surface/50 cursor-pointer',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick && handleRowClick(record, rowIndex)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        'text-foreground',
                        cellPaddingClasses[size],
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {getValue(record, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

Table.displayName = 'Table'

// Table sub-components
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader: React.FC<TableHeaderProps> = ({ className, children, ...props }) => (
  <thead className={cn('bg-surface/50', className)} {...props}>
    {children}
  </thead>
)
TableHeader.displayName = 'TableHeader'

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody: React.FC<TableBodyProps> = ({ className, children, ...props }) => (
  <tbody className={cn('', className)} {...props}>
    {children}
  </tbody>
)
TableBody.displayName = 'TableBody'

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow: React.FC<TableRowProps> = ({ className, children, ...props }) => (
  <tr
    className={cn('border-b border-border hover:bg-surface/50', className)}
    {...props}
  >
    {children}
  </tr>
)
TableRow.displayName = 'TableRow'

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell: React.FC<TableCellProps> = ({ className, children, ...props }) => (
  <td
    className={cn('px-4 py-3 text-foreground', className)}
    {...props}
  >
    {children}
  </td>
)
TableCell.displayName = 'TableCell'

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHead: React.FC<TableHeadProps> = ({ className, children, ...props }) => (
  <th
    className={cn('px-4 py-3 font-medium text-left text-foreground border-b border-border', className)}
    {...props}
  >
    {children}
  </th>
)
TableHead.displayName = 'TableHead'

export { Table, TableHeader, TableBody, TableRow, TableCell, TableHead }