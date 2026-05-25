import type { ModuleName } from './user'

export type NotificationType = 'info' | 'warning' | 'error' | 'success'

export interface AppNotification {
  id: string
  type: NotificationType
  module: ModuleName
  title: string
  message: string
  createdAt: Date
  read: boolean
  actionUrl?: string
}
