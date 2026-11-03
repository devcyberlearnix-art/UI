import React from 'react';

export const Table = ({
  columns = [],
  data = [],
  keyExtractor = (item, index) => item.id ?? index,
  renderRow,
  emptyMessage = 'No records found',
  className = '',
  children,
}) => {
  return (
    <div
      className={`w-full overflow-x-auto rounded-2xl border border-[#E3DCD3] dark:border-white/[0.08] bg-[#FFFEFA] dark:bg-[#1D1C1A] shadow-xs ${className}`}
    >
      <table className="w-full text-left border-collapse text-sm">
        {columns.length > 0 && (
          <thead>
            <tr className="border-b border-[#E3DCD3] dark:border-white/[0.08] bg-[#FAF7F2] dark:bg-[#151413]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#635E56] dark:text-[#A69F94] ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.title ?? col.label ?? col}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-[#E3DCD3]/60 dark:divide-white/[0.04]">
          {data.length > 0 ? (
            data.map((item, index) =>
              renderRow ? (
                renderRow(item, index)
              ) : (
                <tr
                  key={keyExtractor(item, index)}
                  className="hover:bg-[#FAF7F2]/60 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className={`px-5 py-4 text-[#282521] dark:text-[#EDE8E1] ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render
                        ? col.render(item[col.key], item, index)
                        : item[col.key]}
                    </td>
                  ))}
                </tr>
              )
            )
          ) : children ? (
            children
          ) : (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="px-6 py-12 text-center text-sm text-[#756E64] dark:text-[#7A7368]"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

