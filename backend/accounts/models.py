from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_JOB_SEEKER = "job_seeker"
    ROLE_RECRUITER = "recruiter"
    ROLE_ADMIN = "admin"
    ROLE_CHOICES = [
        (ROLE_JOB_SEEKER, "Job seeker"),
        (ROLE_RECRUITER, "Recruiter"),
        (ROLE_ADMIN, "Admin"),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_JOB_SEEKER)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


class SeekerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="seeker_profile",
        limit_choices_to={"role": User.ROLE_JOB_SEEKER},
    )
    skills = models.ManyToManyField("skills.Skill", blank=True, related_name="seeker_profiles")
    headline = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"SeekerProfile({self.user.email})"


class RecruiterProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="recruiter_profile",
        limit_choices_to={"role": User.ROLE_RECRUITER},
    )
    company_name = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"RecruiterProfile({self.user.email})"


class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")
    file = models.FileField(upload_to="resumes/%Y/%m/")
    extracted_text = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"Resume({self.user_id}, {self.uploaded_at})"
