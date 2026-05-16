from rest_framework import serializers

from accounts.models import Resume
from jobs.serializers import JobSerializer

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    job_detail = JobSerializer(source="job", read_only=True)
    seeker_email = serializers.EmailField(source="seeker.email", read_only=True)
    application_resume = serializers.SerializerMethodField(read_only=True)
    resume_match_score = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "job",
            "job_detail",
            "seeker",
            "seeker_email",
            "application_resume",
            "resume_match_score",
            "status",
            "notes",
            "applied_at",
            "updated_at",
        )
        read_only_fields = (
            "job",
            "seeker",
            "seeker_email",
            "application_resume",
            "resume_match_score",
            "applied_at",
            "updated_at",
            "job_detail",
        )

    def get_application_resume(self, obj):
        from accounts.serializers import ResumeSerializer

        resume = obj.resume
        if not resume:
            return None
        return ResumeSerializer(resume, context=self.context).data

    def get_resume_match_score(self, obj):
        from skills.skill_matching import job_skill_match_score, suggest_skills_from_text

        resume = obj.resume
        if not resume or not resume.extracted_text:
            return None
        skill_ids = {s.id for s in suggest_skills_from_text(resume.extracted_text)}
        return job_skill_match_score(skill_ids, obj.job)


class ApplicationCreateSerializer(serializers.ModelSerializer):
    resume = serializers.PrimaryKeyRelatedField(
        queryset=Resume.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Application
        fields = ("job", "resume")

    def validate_job(self, job):
        from jobs.models import Job

        if job.status != Job.STATUS_PUBLISHED:
            raise serializers.ValidationError("You can only apply to published jobs.")
        return job

    def validate_resume(self, resume):
        request = self.context["request"]
        if resume and resume.user_id != request.user.id:
            raise serializers.ValidationError("You can only use your own resume.")
        return resume

    def create(self, validated_data):
        request = self.context["request"]
        if not validated_data.get("resume"):
            validated_data["resume"] = request.user.resumes.order_by("-uploaded_at").first()
        return Application.objects.create(seeker=request.user, **validated_data)
