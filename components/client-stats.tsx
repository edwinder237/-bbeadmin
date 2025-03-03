import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, ClockIcon as UserClock, Building } from "lucide-react"


type ClientStats = {
  totalClients: number
  activeClients: number
  pendingClients: number
  inactiveClients: number
}

export function ClientStats({ stats }: { stats: ClientStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Client Status Breakdown</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg transition-colors px-2">
              <span className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">Production</span>
              </span>
              <span className="text-lg font-semibold">{stats.activeClients}</span>
            </div>
            <div className="flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg transition-colors px-2">
              <span className="flex items-center">
                <UserClock className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">Testing</span>
              </span>
              <span className="text-lg font-semibold">{stats.pendingClients}</span>
            </div>
            <div className="flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg transition-colors px-2">
              <span className="flex items-center">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Development</span>
              </span>
              <span className="text-lg font-semibold">{stats.inactiveClients}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

