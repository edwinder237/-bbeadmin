"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  ArrowUpDown, 
  Search,
  Filter,
  Edit,
  ExternalLink,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
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
  productionUrl?: string
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
  const [currentPage, setCurrentPage] = useState(1)
  const [showInactive, setShowInactive] = useState(false)
  const [siteStatus, setSiteStatus] = useState<Record<string, 'loading' | 'online' | 'offline' | 'unknown'>>({})
  const [isCheckingAllSites, setIsCheckingAllSites] = useState(false)
  const itemsPerPage = 20
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'name',
      desc: false
    },
    {
      id: 'status',
      desc: false
    }
  ])

  // Function to check site status
  const checkSiteStatus = useCallback(async (url: string, clientId: string) => {
    
    setSiteStatus(prev => ({ ...prev, [clientId]: 'loading' }));
    
    try {
      // Method 1: Try fetch with no-cors
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setSiteStatus(prev => ({ ...prev, [clientId]: 'offline' }));
      }, 8000);
      
      try {
        await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        clearTimeout(timeoutId);
        setSiteStatus(prev => ({ ...prev, [clientId]: 'online' }));
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Method 2: Try loading an image as fallback
        const img = new Image();
        const imgTimeout = setTimeout(() => {
          setSiteStatus(prev => ({ ...prev, [clientId]: 'offline' }));
        }, 5000);
        
        img.onload = () => {
          clearTimeout(imgTimeout);
          setSiteStatus(prev => ({ ...prev, [clientId]: 'online' }));
        };
        
        img.onerror = () => {
          clearTimeout(imgTimeout);
          setSiteStatus(prev => ({ ...prev, [clientId]: 'offline' }));
        };
        
        img.src = `${url}/favicon.ico?t=${Date.now()}`;
      }
      
    } catch (error) {
      setSiteStatus(prev => ({ ...prev, [clientId]: 'offline' }));
    }
  }, []);

  // Function to check all sites
  const checkAllSites = useCallback(async () => {
    setIsCheckingAllSites(true);
    
    // Clear previous status and set all to loading
    const loadingStatus: Record<string, 'loading'> = {};
    clients.forEach(client => {
      loadingStatus[client.id] = 'loading';
    });
    setSiteStatus(loadingStatus);
    
    // Check each site with a small delay to avoid overwhelming
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      const productionUrl = client.productionUrl?.trim();
      const siteUrl = productionUrl || `https://${client.name.toLowerCase().replace(/\s+/g, '')}.com`;
      
      // Add delay between requests
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      checkSiteStatus(siteUrl, client.id);
    }
    
    // Set checking complete after a delay
    setTimeout(() => {
      setIsCheckingAllSites(false);
    }, 10000);
  }, [clients, checkSiteStatus]);

  // Check site status for all clients on mount
  useEffect(() => {
    checkAllSites();
  }, [checkAllSites]);

  // Filter clients based on selected filters
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const statusMatch = statusFilter === "all" || client.status === statusFilter;
      const integrationMatch = integrationFilter === "all" || client.integrationType === integrationFilter;
      const inactiveMatch = showInactive || client.status !== "Inactive";
      return statusMatch && integrationMatch && inactiveMatch;
    });
  }, [clients, statusFilter, integrationFilter, showInactive]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, integrationFilter, globalFilter, showInactive]);

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
              asChild
            >
              <Link href={`/dashboard/clients/${row.original.id}/preferences`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Open Client in New Tab</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
              asChild
            >
              <Link href={`/dashboard/clients/${row.original.id}/preferences`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Preferences</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
              onClick={() => {}}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Client</span>
            </Button>
          </div>
        ),
      },
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
                ID: {row.original.cuid}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'siteUrl',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-8 px-2">
            Site URL
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const productionUrl = row.original.productionUrl?.trim();
          const fallbackUrl = `https://${row.original.name.toLowerCase().replace(/\s+/g, '')}.com`;
          const siteUrl = productionUrl || fallbackUrl;
          const isUsingFallback = !productionUrl;
          const status = siteStatus[row.original.id] || 'unknown';
          
          
          const getStatusIcon = () => {
            switch (status) {
              case 'loading':
                return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
              case 'online':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
              case 'offline':
                return <XCircle className="h-4 w-4 text-red-500" />;
              default:
                return <div className="h-4 w-4 rounded-full bg-gray-300" title="Status unknown" />;
            }
          };
          
          const getStatusText = () => {
            switch (status) {
              case 'loading':
                return 'Checking...';
              case 'online':
                return 'Site online';
              case 'offline':
                return 'Site unreachable';
              default:
                return 'Status unknown';
            }
          };
          
          return (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  {getStatusIcon()}
                </div>
                <div className={`truncate max-w-[160px] ${isUsingFallback ? 'font-normal text-muted-foreground italic' : 'font-medium'}`} title={`${siteUrl} - ${getStatusText()}${isUsingFallback ? ' (fallback URL)' : ''}`}>
                  {siteUrl}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                asChild
              >
                <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                  <span className="sr-only">Open site in new tab</span>
                </a>
              </Button>
            </div>
          );
        },
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
    ],
    [siteStatus]
  );

  const table = useReactTable({
    data: paginatedClients,
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
              <Button
                variant="outline"
                size="sm"
                onClick={checkAllSites}
                disabled={isCheckingAllSites}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingAllSites ? 'animate-spin' : ''}`} />
                <span>{isCheckingAllSites ? 'Checking...' : 'Check Sites'}</span>
              </Button>
              <AddClientModal onClientAdded={() => {}} />
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

            {/* Show Inactive Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive" className="text-sm font-medium">
                Show Inactive
              </Label>
            </div>
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

          {/* Table Footer with Pagination */}
          {table.getRowModel().rows?.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
                {(statusFilter !== "all" || integrationFilter !== "all") && (
                  <span> (filtered from {clients.length} total)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                {(statusFilter !== "all" || integrationFilter !== "all") && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setStatusFilter("all");
                      setIntegrationFilter("all");
                    }}
                    className="ml-4"
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

