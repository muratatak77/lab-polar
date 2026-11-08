from datetime import timedelta

import pytest

from polar.kit.db.postgres import AsyncSession
from polar.kit.utils import utc_now
from polar.models import Organization, WebhookEndpoint
from polar.models.webhook_endpoint import WebhookFormat
from scripts.backfill_webhook_endpoint_disabled_at import backfill_statement
from scripts.helper import run_batched_update
from tests.fixtures.database import SaveFixture


@pytest.mark.anyio
class TestBackfillWebhookEndpointDisabledAt:
    async def test_backfills_disabled_endpoints(
        self,
        session: AsyncSession,
        save_fixture: SaveFixture,
        organization: Organization,
    ) -> None:
        now = utc_now()
        created_at = now - timedelta(days=10)
        modified_at = now - timedelta(days=3)
        already_set_at = now - timedelta(days=1)
        endpoints = [
            WebhookEndpoint(
                url="https://example.com/hook",
                format=WebhookFormat.raw,
                organization=organization,
                secret="foobar",
                created_at=created_at,
                enabled=enabled,
                disabled_at=disabled_at,
            )
            for enabled, disabled_at in (
                (False, None),
                (False, None),
                (False, already_set_at),
                (True, None),
            )
        ]
        for endpoint in endpoints:
            await save_fixture(endpoint)
        modified, never_modified, already_set, enabled = endpoints
        modified.modified_at = modified_at
        await save_fixture(modified)

        updated = await run_batched_update(
            backfill_statement(), batch_size=1, sleep_seconds=0, session=session
        )

        assert updated == 2
        for endpoint in endpoints:
            await session.refresh(endpoint)
        assert modified.disabled_at == modified_at
        assert modified.modified_at == modified_at
        assert never_modified.disabled_at == created_at
        assert never_modified.modified_at is None
        assert already_set.disabled_at == already_set_at
        assert enabled.disabled_at is None
        assert (
            await run_batched_update(
                backfill_statement(), batch_size=1, sleep_seconds=0, session=session
            )
            == 0
        )
