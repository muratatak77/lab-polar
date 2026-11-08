import { schemas } from '@polar-sh/client'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WebhookDisabledNotice } from './WebhookDisabledNotice'

const endpoint = (enabled: boolean, disabledAt: string | null) =>
  ({
    id: 'endpoint-1',
    enabled,
    disabled_at: disabledAt,
  }) as schemas['WebhookEndpoint']

const statusChange = (
  reason: schemas['WebhookEndpointStatusChangeReason'],
): schemas['WebhookEndpointStatusChange'] => ({
  id: 'status-change-1',
  created_at: '2026-11-01T10:00:00Z',
  modified_at: null,
  webhook_endpoint_id: 'endpoint-1',
  enabled: false,
  reason,
})

describe('WebhookDisabledNotice', () => {
  it('renders nothing for an enabled endpoint', () => {
    const { container } = render(
      <WebhookDisabledNotice endpoint={endpoint(true, null)} />,
    )

    expect(container.textContent).toBe('')
  })

  it('explains an endpoint disabled after failed deliveries', () => {
    const { container } = render(
      <WebhookDisabledNotice
        endpoint={endpoint(false, '2026-11-01T10:00:00Z')}
        latestStatusChange={statusChange('consecutive_failures')}
      />,
    )

    const text = container.textContent ?? ''
    expect(text).toContain('Disabled after consecutive failed deliveries')
    expect(text).toContain('returns a 2xx response')
  })

  it('shows the reason of a manually disabled endpoint', () => {
    const { container } = render(
      <WebhookDisabledNotice
        endpoint={endpoint(false, '2026-11-01T10:00:00Z')}
        latestStatusChange={statusChange('admin')}
      />,
    )

    const text = container.textContent ?? ''
    expect(text).toContain('This endpoint is disabled')
    expect(text).toContain('Changed by Polar support.')
  })
})
