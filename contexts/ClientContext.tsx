import { createContext, useContext, useState } from 'react'

interface APIClient {
  id: number
  cuid: string
  email: string
  name: string
  integrationId: number
  accessToken: string | null
  tokenExpire: number | null
  clientID: string | null
  clientSecret: string | null
  ApiKey: string | null
  AppKey: string | null
  createdAt: string
  updatedAt: string
  channelID: string
  styleId: string | null
  mainLogo: string | null
  stateLocation: string | null
  actuations: number
}

interface ClientContextType {
  selectedClient: APIClient | null
  setSelectedClient: (client: APIClient) => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [selectedClient, setSelectedClient] = useState<APIClient | null>(null)

  return (
    <ClientContext.Provider value={{ selectedClient, setSelectedClient }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider')
  }
  return context
}