import re
from io import BytesIO

from skills.models import Skill


def extract_text_from_pdf_upload(uploaded_file) -> str:
    from pypdf import PdfReader

    raw = uploaded_file.read()
    reader = PdfReader(BytesIO(raw))
    parts = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts)


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def suggest_skills_from_text(text: str, skills=None):
    """Match resume text against canonical Skill names (word-boundary style)."""
    if skills is None:
        skills = list(Skill.objects.all())
    hay = normalize_text(text)
    if not hay:
        return []
    found = []
    seen = set()
    for skill in skills:
        name = skill.name.strip()
        if not name or len(name) < 2:
            continue
        needle = normalize_text(name)
        pattern = r"(?<![a-z0-9#+])" + re.escape(needle) + r"(?![a-z0-9#+])"
        if re.search(pattern, hay, re.IGNORECASE):
            if skill.id not in seen:
                seen.add(skill.id)
                found.append(skill)
    return found


def job_skill_match_score(seeker_skill_ids: set, job) -> float:
    """Weighted overlap: required skills count double."""
    links = list(job.job_skills.select_related("skill"))
    if not links:
        return 0.0
    score = 0.0
    max_w = 0.0
    for js in links:
        w = 2.0 if js.required else 1.0
        max_w += w
        if js.skill_id in seeker_skill_ids:
            score += w
    if max_w <= 0:
        return 0.0
    return round(score / max_w, 4)
