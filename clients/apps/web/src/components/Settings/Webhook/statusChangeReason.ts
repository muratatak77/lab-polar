import { schemas } from '@polar-sh/client'

export const STATUS_CHANGE_REASON_LABELS: Record<
  schemas['WebhookEndpointStatusChangeReason'],
  string
> = {
  manual: 'Changed manually',
  consecutive_failures: 'Too many consecutive failed deliveries',
  admin: 'Changed by Polar support',
}
