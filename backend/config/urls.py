from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    EmailTokenObtainPairView,
    MeView,
    RecruiterProfileDetailView,
    RegisterView,
    ResumeViewSet,
    SeekerProfileDetailView,
)
from analytics.views import AnalyticsSummaryView
from applications.views import ApplicationViewSet
from jobs.views import JobViewSet
from skills.views import SkillViewSet

router = DefaultRouter()
router.register(r"skills", SkillViewSet, basename="skill")
router.register(r"jobs", JobViewSet, basename="job")
router.register(r"applications", ApplicationViewSet, basename="application")
router.register(r"resumes", ResumeViewSet, basename="resume")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/token/", EmailTokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("api/me/", MeView.as_view()),
    path("api/seeker/profile/", SeekerProfileDetailView.as_view()),
    path("api/recruiter/profile/", RecruiterProfileDetailView.as_view()),
    path("api/analytics/summary/", AnalyticsSummaryView.as_view()),
    path("api/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
