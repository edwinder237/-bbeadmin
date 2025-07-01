"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface RemoveClientModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClients: string[]
  onConfirm: () => Promise<void>
  mutate?: () => Promise<void>
}

export function RemoveClientModal({ isOpen, onClose, selectedClients, onConfirm, mutate }: RemoveClientModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080'
  
  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    console.log(selectedClients)
    try {
      // Delete each client sequentially
      for (const clientCuid of selectedClients) {
        const response = await fetch(`${SERVER_URL}/api/getAdminData?clientCuid=${clientCuid}`, {
          method: 'DELETE',
        });
      

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to delete client')
        }
      }

      // Refresh the clients data
      if (mutate) {
        await mutate()
      }
      
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error deleting clients:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete clients')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {selectedClients.length} Client{selectedClients.length > 1 ? 's' : ''}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedClients.length === 1 ? 'this client' : 'these clients'}? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 mt-2">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
