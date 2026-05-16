from django.conf import settings
from django.db import models


class Application(models.Model):
    STATUS_SUBMITTED = "submitted"
    STATUS_REVIEWING = "reviewing"
    STATUS_INTERVIEW = "interview"
    STATUS_OFFER = "offer"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_SUBMITTED, "Submitted"),
        (STATUS_REVIEWING, "Reviewing"),
        (STATUS_INTERVIEW, "Interview"),
        (STATUS_OFFER, "Offer"),
        (STATUS_REJECTED, "Rejected"),
    ]

    job = models.ForeignKey("jobs.Job", on_delete=models.CASCADE, related_name="applications")
    seeker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    resume = models.ForeignKey(
        "accounts.Resume",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applications_submitted",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_SUBMITTED)
    notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_at"]
        constraints = [
            models.UniqueConstraint(fields=["job", "seeker"], name="unique_application_per_job_seeker"),
        ]

    def __str__(self):
        return f"{self.seeker_id} -> {self.job_id} ({self.status})"
