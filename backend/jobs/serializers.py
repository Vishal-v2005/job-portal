from rest_framework import serializers

from skills.models import Skill
from skills.serializers import SkillSerializer

from .models import Job, JobSkill


class JobSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        source="skill",
        write_only=True,
    )

    class Meta:
        model = JobSkill
        fields = ("id", "skill", "skill_id", "required")


class JobSerializer(serializers.ModelSerializer):
    job_skills = JobSkillSerializer(many=True, read_only=True)
    recruiter_email = serializers.EmailField(source="recruiter.email", read_only=True)
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            "id",
            "recruiter",
            "recruiter_email",
            "title",
            "description",
            "location",
            "status",
            "created_at",
            "updated_at",
            "job_skills",
            "match_score",
        )
        read_only_fields = ("recruiter", "recruiter_email", "created_at", "updated_at")

    def get_match_score(self, obj):
        scores = self.context.get("match_scores") or {}
        if scores:
            return scores.get(obj.id)
        return getattr(obj, "match_score", None)


class JobWriteSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text='[{"skill_id": 1, "required": true}, ...]',
    )

    class Meta:
        model = Job
        fields = (
            "title",
            "description",
            "location",
            "status",
            "skills",
        )

    def create(self, validated_data):
        skills_data = validated_data.pop("skills", [])
        job = Job.objects.create(recruiter=self.context["request"].user, **validated_data)
        self._sync_skills(job, skills_data)
        return job

    def update(self, instance, validated_data):
        skills_data = validated_data.pop("skills", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if skills_data is not None:
            self._sync_skills(instance, skills_data)
        return instance

    def _sync_skills(self, job, skills_data):
        job.job_skills.all().delete()
        for row in skills_data:
            sid = row.get("skill_id")
            required = row.get("required", True)
            if sid is None:
                continue
            skill = Skill.objects.filter(pk=sid).first()
            if skill:
                JobSkill.objects.create(job=job, skill=skill, required=bool(required))
