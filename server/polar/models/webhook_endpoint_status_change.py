from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, declared_attr, mapped_column, relationship

from polar.kit.db.models.base import RecordModel

if TYPE_CHECKING:
    from .webhook_endpoint import WebhookEndpoint


class WebhookEndpointStatusChangeReason(StrEnum):
    manual = "manual"
    consecutive_failures = "consecutive_failures"
    admin = "admin"


class WebhookEndpointStatusChange(RecordModel):
    __tablename__ = "webhook_endpoint_status_changes"
    __table_args__ = (
        Index(
            "ix_webhook_endpoint_status_changes_endpoint_id_created_at",
            "webhook_endpoint_id",
            "created_at",
        ),
    )

    webhook_endpoint_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("webhook_endpoints.id", ondelete="CASCADE"),
        nullable=False,
    )

    @declared_attr
    def webhook_endpoint(cls) -> Mapped["WebhookEndpoint"]:
        return relationship("WebhookEndpoint", lazy="raise")

    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False)
    reason: Mapped[WebhookEndpointStatusChangeReason] = mapped_column(
        String, nullable=False
    )
