import { ClientsList } from "@/components/clients-list";
import { ClientStats } from "@/components/client-stats";

interface ClientData {
  id: number;
  name: string;
  email: string;
  updatedAt: string;
  status: string;
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

async function getClients() {
  const res = await fetch(`${SERVER_URL}/api/getAdminData`, {
    cache: "no-store",
  });
  //console.log(`response`, res);
  if (!res.ok) {
    throw new Error("Failed to fetch clients");
  }

  const data = await res.json();
  return data.map((client: ClientData) => ({
    ...client,
    id: client.id.toString(),
    name: client.name,
    email: client.email,
    lastActive: new Date(client.updatedAt).toISOString().split("T")[0],
    status: client.status || "unknown",
    client: client,
  }));
}



export default async function ClientsPage() {
  const clients = await getClients();
  const clientStats = {
    totalClients: clients.length,
    activeClients: clients.filter(
      (c: { status: string }) => c.status === "Production"
    ).length,
    pendingClients: clients.filter(
      (c: { status: string }) => c.status === "Testing"
    ).length,
    inactiveClients: clients.filter(
      (c: { status: string }) => c.status === "Development"
    ).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
      </div>
      <ClientStats stats={clientStats} />
      <ClientsList initialClients={clients} />
    </div>
  );
}
