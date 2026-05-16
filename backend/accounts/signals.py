from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import RecruiterProfile, SeekerProfile, User


@receiver(post_save, sender=User)
def ensure_role_profile(sender, instance, created, **kwargs):
    if instance.role == User.ROLE_JOB_SEEKER:
        SeekerProfile.objects.get_or_create(user=instance)
    elif instance.role == User.ROLE_RECRUITER:
        RecruiterProfile.objects.get_or_create(user=instance)
