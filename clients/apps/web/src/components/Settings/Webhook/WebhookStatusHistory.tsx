'use client'

import { schemas } from '@polar-sh/client'
import { Status, Text } from '@polar-sh/orbit'
import { Box } from '@polar-sh/orbit/Box'
import FormattedDateTime from '@polar-sh/ui/components/atoms/FormattedDateTime'
import { STATUS_CHANGE_REASON_LABELS } from './statusChangeReason'

export const WebhookStatusHistory = ({
  statusChanges,
}: {
  statusChanges: schemas['WebhookEndpointStatusChange'][]
}) => {
  if (statusChanges.length === 0) {
    return null
  }

  return (
    <Box flexDirection="column" gap="m">
      <Text as="h2" variant="heading-xs">
        Status history
      </Text>
      <Box
        as="ul"
        flexDirection="column"
        borderWidth={1}
        borderStyle="solid"
        borderColor="border-primary"
        borderRadius="l"
        overflow="hidden"
      >
        {statusChanges.map((statusChange, index) => (
          <Box
            as="li"
            key={statusChange.id}
            display="flex"
            alignItems="center"
            justifyContent="between"
            gap="l"
            paddingHorizontal="l"
            paddingVertical="s"
            borderTopWidth={index === 0 ? 0 : 1}
            borderStyle="solid"
            borderColor="border-primary"
          >
            <Box alignItems="center" gap="m">
              <Status
                size="small"
                color={statusChange.enabled ? 'green' : 'red'}
                status={statusChange.enabled ? 'Enabled' : 'Disabled'}
              />
              <Text>{STATUS_CHANGE_REASON_LABELS[statusChange.reason]}</Text>
            </Box>
            <Text color="muted">
              <FormattedDateTime
                datetime={statusChange.created_at}
                dateStyle="medium"
                resolution="time"
              />
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
