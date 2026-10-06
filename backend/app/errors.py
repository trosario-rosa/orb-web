class ServiceError(Exception):
    """A refused request; the message is safe to show to the client."""

    message = ""

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.message)


class UserNotFound(ServiceError):
    message = "User not found"


class EmailInUse(ServiceError):
    message = "Email is already in use by another user"


class VersionRequired(ServiceError):
    message = "If-Match header is required"


class VersionMismatch(ServiceError):
    message = "ETag does not match; fetch the user again"


class InvalidImport(ServiceError):
    pass
