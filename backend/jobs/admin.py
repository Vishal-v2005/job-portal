from django.contrib import admin

from .models import Job, JobSkill


class JobSkillInline(admin.TabularInline):
    model = JobSkill
    extra = 1


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "recruiter", "status", "created_at")
    list_filter = ("status",)
    inlines = (JobSkillInline,)
