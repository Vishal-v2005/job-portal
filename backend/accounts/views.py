from rest_framework import generics, permissions, status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from skills.skill_matching import extract_text_from_pdf_upload, suggest_skills_from_text

from .models import RecruiterProfile, Resume, SeekerProfile, User
from .permissions import IsJobSeeker, IsRecruiter
from .serializers import (
    RecruiterProfileSerializer,
    RegisterSerializer,
    ResumeSerializer,
    SeekerProfileSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        ser = UserSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


class SeekerProfileDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsJobSeeker)

    def get(self, request):
        profile, _ = SeekerProfile.objects.get_or_create(user=request.user)
        return Response(SeekerProfileSerializer(profile).data)

    def patch(self, request):
        profile, _ = SeekerProfile.objects.get_or_create(user=request.user)
        ser = SeekerProfileSerializer(profile, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


class RecruiterProfileDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsRecruiter)

    def get(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        return Response(RecruiterProfileSerializer(profile).data)

    def patch(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        ser = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = (permissions.IsAuthenticated, IsJobSeeker)
    parser_classes = (MultiPartParser, FormParser)
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        upload = self.request.FILES.get("file")
        if not upload:
            raise ValueError("file required")
        name = (upload.name or "").lower()
        text = ""
        if name.endswith(".pdf"):
            text = extract_text_from_pdf_upload(upload)
            upload.seek(0)
        elif name.endswith(".txt"):
            text = (upload.read() or b"").decode("utf-8", errors="replace")
            upload.seek(0)
        serializer.save(user=self.request.user, extracted_text=text[:500000])

    def create(self, request, *args, **kwargs):
        if "file" not in request.FILES:
            return Response({"detail": "Missing file."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except Exception as exc:  # noqa: BLE001
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["get"])
    def suggested_skills(self, request, pk=None):
        resume = self.get_object()
        skills = suggest_skills_from_text(resume.extracted_text)
        from skills.serializers import SkillSerializer

        return Response(SkillSerializer(skills, many=True).data)


class EmailTokenObtainPairView(TokenObtainPairView):
    """Uses User.USERNAME_FIELD (email) via SimpleJWT default body."""

    pass
