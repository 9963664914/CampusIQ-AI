from django.db import models


class StudentRecord(models.Model):
    student_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=120)
    department = models.CharField(max_length=80, blank=True)
    academic_year = models.CharField(max_length=20, blank=True)
    attendance = models.FloatField(null=True, blank=True)
    academic_score = models.FloatField(null=True, blank=True)
    exam_average = models.FloatField(null=True, blank=True)
    lms_engagement = models.FloatField(null=True, blank=True)
    placement_readiness = models.FloatField(null=True, blank=True)
    technical_skills = models.FloatField(null=True, blank=True)
    aptitude_score = models.FloatField(null=True, blank=True)
    communication_score = models.FloatField(null=True, blank=True)
    soft_skills = models.FloatField(null=True, blank=True)
    engagement_score = models.FloatField(null=True, blank=True)
    feedback_score = models.FloatField(null=True, blank=True)
    previous_score = models.FloatField(null=True, blank=True)
    previous_attendance = models.FloatField(null=True, blank=True)
    placement_status = models.CharField(max_length=50, blank=True)
    data_notes = models.TextField(blank=True)
    score = models.FloatField(default=0.0)
    score_coverage = models.FloatField(default=0.0)
    academic_risk = models.CharField(max_length=20, blank=True)
    placement_risk = models.CharField(max_length=20, blank=True)
    incomplete_data = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['student_id']

    def __str__(self):
        return f'{self.student_id} - {self.name}'
