'use client'

import { schemas } from '@polar-sh/client'
import { Alert } from '@polar-sh/orbit'
import FormattedDateTime from '@polar-sh/ui/components/atoms/FormattedDateTime'
import { STATUS_CHANGE_REASON_LABELS } from './statusChangeReason'

export const WebhookDisabledNotice = ({
  endpoint,
  latestStatusChange,
}: {
  endpoint: schemas['WebhookEndpoint']
  latestStatusChange?: schemas['WebhookEndpointStatusChange']
}) => {
  if (endpoint.enabled || !endpoint.disabled_at) {
    return null
  }

  const autoDisabled =
    latestStatusChange?.enabled === false &&
    latestStatusChange.reason === 'consecutive_failures'

  return (
    <Alert
      variant={autoDisabled ? 'danger' : 'warning'}
      title={
        autoDisabled
          ? 'Disabled after consecutive failed deliveries'
          : 'This endpoint is disabled'
      }
      description={
        <>
          No events have been sent since{' '}
          <FormattedDateTime
            datetime={endpoint.disabled_at}
            dateStyle="medium"
            resolution="time"
          />
          .{' '}
          {autoDisabled
            ? 'Make sure the endpoint is reachable and returns a 2xx response before you enable it again.'
            : latestStatusChange && !latestStatusChange.enabled
              ? `${STATUS_CHANGE_REASON_LABELS[latestStatusChange.reason]}.`
              : null}
        </>
      }
    />
  )
}
