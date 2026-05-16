from rest_framework import permissions, viewsets

from .models import Skill
from .serializers import SkillSerializer


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = (permissions.IsAuthenticated,)
