from django.core.management.base import BaseCommand

from skills.models import Skill

DEFAULT_SKILLS = [
    ("Python", "Language"),
    ("JavaScript", "Language"),
    ("TypeScript", "Language"),
    ("Java", "Language"),
    ("Go", "Language"),
    ("Rust", "Language"),
    ("SQL", "Data"),
    ("MySQL", "Data"),
    ("PostgreSQL", "Data"),
    ("Django", "Framework"),
    ("React", "Framework"),
    ("Node.js", "Runtime"),
    ("REST API", "Concept"),
    ("Docker", "DevOps"),
    ("Kubernetes", "DevOps"),
    ("AWS", "Cloud"),
    ("Azure", "Cloud"),
    ("Git", "Tool"),
    ("Machine Learning", "Domain"),
    ("Data Analysis", "Domain"),
    ("HTML", "Web"),
    ("CSS", "Web"),
    ("Linux", "System"),
]


class Command(BaseCommand):
    help = "Insert canonical skills if missing (idempotent)."

    def handle(self, *args, **options):
        n = 0
        for name, category in DEFAULT_SKILLS:
            _, created = Skill.objects.get_or_create(name=name, defaults={"category": category})
            if created:
                n += 1
        self.stdout.write(self.style.SUCCESS(f"Skills ready ({n} new)."))
