import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { HighScore } from '@/types/game.types';

const columnHelper = createColumnHelper<HighScore>();

const RANK_COLORS = ['text-[#ffd700]', 'text-[#c0c0c0]', 'text-[#cd7f32]'] as const;

const columns = [
  columnHelper.display({
    id: 'rank',
    header: '#',
    cell: ({ row }) => (
      <span className={RANK_COLORS[row.index] ?? 'text-[#333]'}>
        {row.index + 1}
      </span>
    ),
  }),
  columnHelper.accessor('playerName', {
    header: 'PLAYER',
    cell: (info) => (
      <span className="text-white tracking-wider">{info.getValue().toUpperCase()}</span>
    ),
  }),
  columnHelper.accessor('score', {
    header: 'SCORE',
    cell: (info) => (
      <span className="text-[#ffd700] tabular-nums">
        {String(info.getValue()).padStart(6, '0')}
      </span>
    ),
  }),
  columnHelper.accessor('level', {
    header: 'LV',
    cell: (info) => <span className="text-[#555]">{info.getValue()}</span>,
  }),
  columnHelper.accessor('timestamp', {
    header: 'DATE',
    cell: (info) => (
      <span className="text-[#222] text-[9px]">
        {new Date(info.getValue()).toLocaleDateString()}
      </span>
    ),
  }),
];

interface Props {
  scores: HighScore[];
}

export function HighScoresTable({ scores }: Props) {
  const table = useReactTable({
    data: scores,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full text-[10px]">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-[#1a1a1a]">
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="py-2 px-1 text-left text-[#ff0000] tracking-widest font-bold"
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b border-[#111] hover:bg-[#0a0a0a] transition-colors">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="py-2 px-1">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
