from django.contrib import admin

from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "seeker", "status", "applied_at")
    list_filter = ("status",)
