"""Set `disabled_at` on webhook endpoints disabled before the column existed.

The exact time is not recorded anywhere. Disabling an endpoint bumps its
`modified_at`, so that is the closest estimate; a later edit of a disabled
endpoint makes it later than the real time.

uv run python -m scripts.backfill_webhook_endpoint_disabled_at
"""

import typer
from sqlalchemy import Update, func, select, update

from polar.models import WebhookEndpoint
from scripts.helper import (
    configure_script_logging,
    limit_bindparam,
    run_batched_update,
    typer_async,
)

cli = typer.Typer()

configure_script_logging()


def backfill_statement() -> Update:
    missing_disabled_at = (
        ~WebhookEndpoint.enabled,
        WebhookEndpoint.disabled_at.is_(None),
    )
    return (
        update(WebhookEndpoint)
        .where(
            WebhookEndpoint.id.in_(
                select(WebhookEndpoint.id)
                .where(*missing_disabled_at)
                .order_by(WebhookEndpoint.id)
                .limit(limit_bindparam())
            ),
            *missing_disabled_at,
        )
        .values(
            disabled_at=func.coalesce(
                WebhookEndpoint.modified_at, WebhookEndpoint.created_at
            ),
            modified_at=WebhookEndpoint.modified_at,
        )
    )


@cli.command()
@typer_async
async def backfill_webhook_endpoint_disabled_at(
    batch_size: int = typer.Option(5000, min=1),
    sleep_seconds: float = typer.Option(0.1, min=0),
) -> None:
    await run_batched_update(
        backfill_statement(), batch_size=batch_size, sleep_seconds=sleep_seconds
    )


if __name__ == "__main__":
    cli()
