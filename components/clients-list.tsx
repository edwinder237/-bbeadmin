"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowUpDown, 
  Search,
  Filter,
  MoreHorizontal,
  Edit
} from "lucide-react"
import { AddClientModal } from "@/components/add-client-modal"
import { useReactTable, ColumnDef, getCoreRowModel, flexRender, getSortedRowModel, SortingState, getFilteredRowModel } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Client {
  id: string
  name: string
  email: string
  lastActive: string
  status: "Active" | "Inactive" | "Pending" | "Development",
  integrationType?: string
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
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [integrationFilter, setIntegrationFilter] = useState<string>("all")
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'lastActive',
      desc: true
    },
    {
      id: 'status',
      desc: false
    }
  ])

  // Filter clients based on selected filters
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const statusMatch = statusFilter === "all" || client.status === statusFilter;
      const integrationMatch = integrationFilter === "all" || client.integrationType === integrationFilter;
      return statusMatch && integrationMatch;
    });
  }, [clients, statusFilter, integrationFilter]);

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8 px-2">
            Client Name
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {row.getValue<string>('name').charAt(0)}
            </div>
            <div>
              <div className="font-medium">{row.getValue('name')}</div>
              <div className="text-sm text-muted-foreground">
                ID: {row.original.cuid.slice(0, 8)}...
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8 px-2">
            Contact
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.getValue('email')}</div>
            <div className="text-sm text-muted-foreground">
              Last active: {new Date(row.getValue<string>('lastActive')).toLocaleDateString()}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'integrationType',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8 px-2">
            Integration
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: info => (
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
          >
            {info.getValue() as string || 'Unknown'}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8 px-2">
            Status
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          const statusConfig = {
            "Active": { 
              color: "bg-green-50 text-green-700 border-green-200", 
              icon: "🟢",
              label: "Production"
            },
            "Pending": { 
              color: "bg-orange-50 text-orange-700 border-orange-200", 
              icon: "🟡",
              label: "Testing"
            },
            "Development": { 
              color: "bg-blue-50 text-blue-700 border-blue-200", 
              icon: "🔵",
              label: "Development"
            },
            "Inactive": { 
              color: "bg-gray-50 text-gray-700 border-gray-200", 
              icon: "⚪",
              label: "Inactive"
            }
          };
          
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Inactive;
          
          return (
            <Badge className={config.color}>
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </Badge>
          );
        },
        sortingFn: (rowA, rowB, columnId) => {
          const statusOrder = {
            "Active": 1,
            "Pending": 2,
            "Development": 3,
            "Inactive": 4
          };
          const a = statusOrder[rowA.getValue(columnId) as keyof typeof statusOrder] || 5;
          const b = statusOrder[rowB.getValue(columnId) as keyof typeof statusOrder] || 5;
          return a - b;
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/clients/${row.original.id}/preferences`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Preferences
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredClients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">{clients.length}</span>
                </div>
                <span>Client Management</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your clients and their integration settings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <AddClientModal onClientAdded={() => window.location.reload()} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name, email, or integration..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px] justify-between">
                  <span className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {statusFilter === "all" ? "All Status" : 
                     statusFilter === "Active" ? "Production" :
                     statusFilter === "Pending" ? "Testing" :
                     statusFilter === "Development" ? "Development" :
                     statusFilter === "Inactive" ? "Inactive" : "Status"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Active")}>
                  🟢 Production
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Development")}>
                  🔵 Development
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>
                  🟡 Testing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>
                  ⚪ Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Integration Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px] justify-between">
                  <span className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {integrationFilter === "all" ? "All Integrations" : integrationFilter}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Filter by Integration</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIntegrationFilter("all")}>
                  All Integrations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIntegrationFilter("Lodgify")}>
                  Lodgify
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIntegrationFilter("Guesty")}>
                  Guesty
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIntegrationFilter("Hostaway")}>
                  Hostaway
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIntegrationFilter("Unknown")}>
                  Unknown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-muted/50">
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} className="h-12">
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow 
                      key={row.id} 
                      className="hover:bg-muted/50 transition-colors"
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">No clients found</p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search or add a new client
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer with Results Count */}
          {table.getRowModel().rows?.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <div>
                Showing {table.getRowModel().rows.length} of {filteredClients.length} clients
                {(statusFilter !== "all" || integrationFilter !== "all") && (
                  <span className="text-muted-foreground"> (filtered from {clients.length} total)</span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span>Total clients: {clients.length}</span>
                {(statusFilter !== "all" || integrationFilter !== "all") && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setStatusFilter("all");
                      setIntegrationFilter("all");
                    }}
                    className="text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

