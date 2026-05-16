from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsJobSeeker, IsRecruiter

from .models import Application
from .serializers import ApplicationCreateSerializer, ApplicationSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ("get", "post", "patch", "head", "options")

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsJobSeeker()]
        if self.action in ("update", "partial_update"):
            return [permissions.IsAuthenticated(), IsRecruiter()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        base = Application.objects.select_related("job", "seeker")
        if user.role == User.ROLE_JOB_SEEKER:
            return base.filter(seeker=user)
        if user.role == User.ROLE_RECRUITER:
            return base.filter(job__recruiter=user)
        if user.role == User.ROLE_ADMIN or user.is_superuser:
            return base
        return base.none()

    def create(self, request, *args, **kwargs):
        from accounts.models import Resume

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        job = data["job"]
        selected_resume = data.get("resume")
        if not selected_resume and not Resume.objects.filter(user=request.user).exists():
            raise ValidationError({"detail": "Please upload your resume before applying."})
        if Application.objects.filter(job=job, seeker=request.user).exists():
            raise ValidationError({"detail": "You have already applied to this job."})
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            ApplicationSerializer(serializer.instance, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def partial_update(self, request, *args, **kwargs):
        app = self.get_object()
        user = request.user
        if user.role == User.ROLE_JOB_SEEKER:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if user.role == User.ROLE_RECRUITER and app.job.recruiter_id != user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)
