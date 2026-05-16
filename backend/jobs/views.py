from django.db.models import Prefetch, Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import SeekerProfile
from accounts.permissions import IsJobSeeker, IsRecruiter
from accounts.serializers import UserSerializer
from skills.skill_matching import job_skill_match_score
from skills.serializers import SkillSerializer

from .models import Job, JobSkill
from .serializers import JobSerializer, JobWriteSerializer


class JobViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return JobWriteSerializer
        return JobSerializer

    def get_permissions(self):
        if self.action in ("create", "mine", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsRecruiter()]
        if self.action == "recommended":
            return [permissions.IsAuthenticated(), IsJobSeeker()]
        if self.action == "recommended_candidates":
            return [permissions.IsAuthenticated(), IsRecruiter()]
        return super().get_permissions()

    def get_queryset(self):
        base = Job.objects.select_related("recruiter").prefetch_related(
            Prefetch("job_skills", queryset=JobSkill.objects.select_related("skill"))
        )
        user = self.request.user
        if self.action in ("mine", "update", "partial_update", "destroy"):
            return base.filter(recruiter=user)
        if self.action in ("list", "recommended"):
            return base.filter(status=Job.STATUS_PUBLISHED)
        if self.action == "recommended_candidates":
            return base.filter(recruiter=user, status=Job.STATUS_PUBLISHED)
        return base.filter(Q(status=Job.STATUS_PUBLISHED) | Q(recruiter=user))

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=["get"], url_path="mine")
    def mine(self, request):
        qs = Job.objects.select_related("recruiter").prefetch_related(
            Prefetch("job_skills", queryset=JobSkill.objects.select_related("skill"))
        ).filter(recruiter=request.user)
        ser = JobSerializer(qs, many=True, context=self.get_serializer_context())
        return Response(ser.data)

    @action(detail=False, methods=["get"])
    def recommended(self, request):
        profile = SeekerProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response([], status=status.HTTP_200_OK)
        skill_ids = set(profile.skills.values_list("id", flat=True))
        jobs = list(self.get_queryset())
        scores = {j.id: job_skill_match_score(skill_ids, j) for j in jobs}
        jobs.sort(key=lambda j: -scores.get(j.id, 0))
        ser = JobSerializer(
            jobs,
            many=True,
            context={**self.get_serializer_context(), "match_scores": scores},
        )
        return Response(ser.data)

    @action(detail=True, methods=["get"])
    def recommended_candidates(self, request, pk=None):
        job = self.get_object()
        if job.recruiter_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        out = []
        for sp in SeekerProfile.objects.select_related("user").prefetch_related("skills"):
            sids = set(sp.skills.values_list("id", flat=True))
            score = job_skill_match_score(sids, job)
            if score > 0:
                out.append(
                    {
                        "user": UserSerializer(sp.user, context={"request": request}).data,
                        "match_score": score,
                        "skills": SkillSerializer(sp.skills.all(), many=True).data,
                    }
                )
        out.sort(key=lambda r: -r["match_score"])
        return Response(out)
