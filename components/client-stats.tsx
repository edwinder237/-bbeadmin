import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  UserCheck, 
  Clock, 
  Building, 
  TrendingUp,
  Activity,
  AlertCircle
} from "lucide-react"

type ClientStats = {
  totalClients: number
  activeClients: number
  pendingClients: number
  developmentClients: number
  inactiveClients: number
}

export function ClientStats({ stats }: { stats: ClientStats }) {
  const statusData = [
    {
      label: "Production",
      value: stats.activeClients,
      percentage: (stats.activeClients / stats.totalClients) * 100,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      progressColor: "bg-green-500"
    },
    {
      label: "Development",
      value: stats.developmentClients,
      percentage: (stats.developmentClients / stats.totalClients) * 100,
      icon: Building,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      progressColor: "bg-yellow-500"
    },
    {
      label: "Testing",
      value: stats.pendingClients,
      percentage: (stats.pendingClients / stats.totalClients) * 100,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      progressColor: "bg-orange-500"
    },
    {
      label: "Inactive",
      value: stats.inactiveClients,
      percentage: (stats.inactiveClients / stats.totalClients) * 100,
      icon: AlertCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      progressColor: "bg-gray-500"
    }
  ];

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Client Status Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {statusData.map((status) => (
              <div key={status.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-lg ${status.bgColor} flex items-center justify-center`}>
                      <status.icon className={`h-5 w-5 ${status.color}`} />
                    </div>
                    <div>
                      <p className="font-medium">{status.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {status.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{status.value}</div>
                    <p className="text-xs text-muted-foreground">clients</p>
                  </div>
                </div>
                                 <div className="w-full bg-gray-200 rounded-full h-2">
                   <div 
                     className={`h-2 rounded-full transition-all duration-300 ${status.progressColor}`}
                     style={{ width: `${status.percentage}%` }}
                   />
                 </div>
              </div>
            ))}
          </div>
        </CardContent>
    </Card>
  )
}

