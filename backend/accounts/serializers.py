from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from skills.models import Skill

from .models import RecruiterProfile, Resume, SeekerProfile, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "first_name", "last_name")
        read_only_fields = ("id", "role")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=[User.ROLE_JOB_SEEKER, User.ROLE_RECRUITER])

    class Meta:
        model = User
        fields = ("username", "email", "password", "role", "first_name", "last_name")

    def validate_password(self, value):
        # Convert Django password validator errors into DRF validation errors (400 JSON),
        # so frontend can show precise feedback instead of generic failure.
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def validate_role(self, value):
        if value not in (User.ROLE_JOB_SEEKER, User.ROLE_RECRUITER):
            raise serializers.ValidationError("Invalid role for self-registration.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class SeekerProfileSerializer(serializers.ModelSerializer):
    skills = serializers.PrimaryKeyRelatedField(many=True, queryset=Skill.objects.all())

    class Meta:
        model = SeekerProfile
        fields = ("headline", "skills")


class RecruiterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = ("company_name",)


class ResumeSerializer(serializers.ModelSerializer):
    suggested_skill_ids = serializers.SerializerMethodField(read_only=True)
    resume_score = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Resume
        fields = ("id", "file", "extracted_text", "uploaded_at", "suggested_skill_ids", "resume_score")
        read_only_fields = ("id", "extracted_text", "uploaded_at", "suggested_skill_ids", "resume_score")

    def get_suggested_skill_ids(self, obj):
        from skills.skill_matching import suggest_skills_from_text

        if not obj.extracted_text:
            return []
        skills = suggest_skills_from_text(obj.extracted_text)
        return [s.id for s in skills]

    def get_resume_score(self, obj):
        # Lightweight quality proxy for MVP UX: more matched known skills => higher score.
        suggested = self.get_suggested_skill_ids(obj)
        return min(100, len(suggested) * 10)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request and instance.file:
            data["file"] = request.build_absolute_uri(instance.file.url)
        return data
