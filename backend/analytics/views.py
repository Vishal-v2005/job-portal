from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from applications.models import Application
from jobs.models import Job
from skills.models import Skill

User = get_user_model()


class AnalyticsSummaryView(APIView):
    permission_classes = (IsAuthenticated, IsAdminRole)

    def get(self, request):
        users_by_role = list(User.objects.values("role").annotate(count=Count("id")))
        jobs_by_status = list(Job.objects.values("status").annotate(count=Count("id")))
        applications_by_status = list(
            Application.objects.values("status").annotate(count=Count("id"))
        )
        top_skills_jobs = list(
            Skill.objects.annotate(job_count=Count("job_links"))
            .order_by("-job_count")[:15]
            .values("name", "job_count")
        )
        top_skills_seekers = list(
            Skill.objects.annotate(seeker_count=Count("seeker_profiles"))
            .order_by("-seeker_count")[:15]
            .values("name", "seeker_count")
        )
        return Response(
            {
                "users_by_role": users_by_role,
                "jobs_by_status": jobs_by_status,
                "applications_by_status": applications_by_status,
                "top_skills_on_jobs": top_skills_jobs,
                "top_skills_on_seekers": top_skills_seekers,
            }
        )
