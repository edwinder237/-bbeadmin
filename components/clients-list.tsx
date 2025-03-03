"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Settings, Wifi, ArrowUpDown } from "lucide-react"
import { AddClientModal } from "@/components/add-client-modal"
import { useReactTable, ColumnDef, getCoreRowModel, flexRender, getSortedRowModel, SortingState } from '@tanstack/react-table'



interface Client {
  id: string
  name: string
  email: string
  lastActive: string
  status: "Active" | "Inactive" | "Pending",
  //eslint-disable-next-line
  client: any,
  cuid: string
}



interface ClientsListProps {
  initialClients: Client[]
}

export function ClientsList({ initialClients }: ClientsListProps) {
  const [clients] = useState<Client[]>(initialClients)
  const [error] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'lastActive',
      desc: true // true for high to low (newest to oldest)
    },
    {
      id: 'status',
      desc: false
    }
  ])



  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: info => (
          <Badge
            className={
              info.getValue() === "Production" ? "bg-green-200 text-green-800 hover:bg-green-200 hover:text-green-800" :
              info.getValue() === "Testing" ? "bg-red-200 text-red-800 hover:bg-red-200 hover:text-red-800" :
              info.getValue() === "Development" ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-800" : ""
            }
          >
            {info.getValue() as string}
          </Badge>
        ),
        sortingFn: (rowA, rowB, columnId) => {
          const statusOrder = {
            "Production": 1,
            "Testing": 2,
            "Development": 3
          };
          const a = statusOrder[rowA.getValue(columnId) as keyof typeof statusOrder] || 4;
          const b = statusOrder[rowB.getValue(columnId) as keyof typeof statusOrder] || 4;
          return a - b;
        }
      },
      {
        accessorKey: 'cuid',
        header: 'Access Key',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'lastActive',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            Last Active
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: info => new Date(info.getValue() as string).toLocaleDateString(),
        sortingFn: 'datetime'
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Link href={`/dashboard/clients/${row.original.id}/preferences`}>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <Wifi className="h-4 w-4" />
              <span className="sr-only">Check Connection</span>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
        </div>
        <AddClientModal onClientAdded={() => window.location.reload()} />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

