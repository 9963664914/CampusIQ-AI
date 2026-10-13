from django.contrib import admin

from .models import StudentRecord


@admin.register(StudentRecord)
class StudentRecordAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'name', 'department', 'academic_year', 'score', 'academic_risk', 'placement_risk', 'incomplete_data')
    search_fields = ('student_id', 'name', 'department')
    list_filter = ('department', 'academic_year', 'academic_risk', 'placement_risk')
