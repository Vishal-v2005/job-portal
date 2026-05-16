from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import RecruiterProfile, Resume, SeekerProfile, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "username", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff")
    ordering = ("email",)
    fieldsets = DjangoUserAdmin.fieldsets + (("Portal", {"fields": ("role",)}),)
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (("Portal", {"fields": ("role",)}),)


@admin.register(SeekerProfile)
class SeekerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "headline")
    filter_horizontal = ("skills",)


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "company_name")


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("user", "uploaded_at")
