from pathlib import Path

from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.views import LoginView, LogoutView
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from django.http import FileResponse
from django.urls import reverse_lazy

from analytics.models import StudentRecord
from analytics.services.data_import import import_student_csv
from analytics.services.risk_analysis import evaluate_risk_flags
from analytics.services.scoring import calculate_student_score
from analytics.services.segmentation import build_segment_summary, detect_student_segment
from analytics.services.recommendations import get_recommendations
from .forms import CSVUploadForm


class CampusLoginView(LoginView):
    template_name = 'registration/login.html'
    form_class = AuthenticationForm
    redirect_authenticated_user = True
    success_url = reverse_lazy('dashboard')

    def form_valid(self, form):
        remember_me = self.request.POST.get('remember_me') == 'on'
        if remember_me:
            self.request.session.set_expiry(60 * 60 * 24 * 30)
        else:
            self.request.session.set_expiry(0)
        return super().form_valid(form)


class CampusLogoutView(LogoutView):
    next_page = reverse_lazy('login')


def _student_queryset(request):
    qs = StudentRecord.objects.all()
    q = request.GET.get('q', '').strip()
    department = request.GET.get('department', '')
    academic_year = request.GET.get('academic_year', '')
    academic_risk = request.GET.get('academic_risk', '')
    placement_risk = request.GET.get('placement_risk', '')
    segment = request.GET.get('segment', '')

    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(student_id__icontains=q) | Q(department__icontains=q))
    if department:
        qs = qs.filter(department=department)
    if academic_year:
        qs = qs.filter(academic_year=academic_year)
    if academic_risk:
        qs = qs.filter(academic_risk=academic_risk)
    if placement_risk:
        qs = qs.filter(placement_risk=placement_risk)
    if segment:
        segment_map = {entry['name']: segment for entry in build_segment_summary(qs) if 'name' in entry}
        if segment in segment_map:
            qs = qs.filter(student_id__in=[s.student_id for s in qs if detect_student_segment(s) and detect_student_segment(s)['name'] == segment])
    return qs


def _score_for_student(student):
    payload = {
        'student_id': student.student_id,
        'name': student.name,
        'department': student.department,
        'academic_year': student.academic_year,
        'attendance': student.attendance,
        'academic_score': student.academic_score,
        'exam_average': student.exam_average,
        'lms_engagement': student.lms_engagement,
        'placement_readiness': student.placement_readiness,
        'technical_skills': student.technical_skills,
        'aptitude_score': student.aptitude_score,
        'communication_score': student.communication_score,
        'soft_skills': student.soft_skills,
        'engagement_score': student.engagement_score,
        'feedback_score': student.feedback_score,
        'previous_score': student.previous_score,
        'previous_attendance': student.previous_attendance,
    }
    return calculate_student_score(payload)


@login_required
def dashboard(request):
    students = _student_queryset(request)
    total_students = students.count()
    if total_students:
        scores = [_score_for_student(student)['score'] for student in students]
        avg_score = round(sum(scores) / len(scores), 1)
    else:
        avg_score = 0.0

    academic_support = sum(1 for student in students if any(flag['type'] == 'academic' for flag in evaluate_risk_flags(student)))
    placement_support = sum(1 for student in students if any(flag['type'] == 'placement' for flag in evaluate_risk_flags(student)))
    incomplete_students = sum(1 for student in students if any(flag['type'] == 'incomplete' for flag in evaluate_risk_flags(student)))

    department_choices = sorted(set(students.values_list('department', flat=True).exclude(department='')))
    academic_year_choices = sorted(set(students.values_list('academic_year', flat=True).exclude(academic_year='')))
    segment_names = [entry['name'] for entry in build_segment_summary(students)]
    score_distribution = [0] * 5
    for student in students:
        score = _score_for_student(student)['score']
        if score >= 80: score_distribution[4] += 1
        elif score >= 60: score_distribution[3] += 1
        elif score >= 40: score_distribution[2] += 1
        elif score >= 20: score_distribution[1] += 1
        else: score_distribution[0] += 1

    chart_labels = ['0-19', '20-39', '40-59', '60-79', '80-100']
    chart_data = score_distribution
    segment_counts = build_segment_summary(students)
    context = {
        'students': students[:10],
        'totals': {'total_students': total_students, 'average_score': avg_score, 'academic_support': academic_support, 'placement_support': placement_support, 'incomplete_students': incomplete_students},
        'department_choices': department_choices,
        'academic_year_choices': academic_year_choices,
        'segment_names': segment_names,
        'score_labels': chart_labels,
        'score_data': chart_data,
        'segment_counts': segment_counts,
    }
    return render(request, 'dashboard.html', context)


@login_required
def student_directory(request):
    students = _student_queryset(request)
    page = request.GET.get('page', 1)
    try:
        page = int(page)
    except ValueError:
        page = 1
    page_size = 10
    start = (page - 1) * page_size
    end = start + page_size
    page_obj = students[start:end]
    total_pages = max(1, (students.count() + page_size - 1) // page_size)
    context = {
        'students': page_obj,
        'page_obj': page_obj,
        'page': page,
        'total_pages': total_pages,
        'department_choices': sorted(set(StudentRecord.objects.exclude(department='').values_list('department', flat=True))),
        'academic_year_choices': sorted(set(StudentRecord.objects.exclude(academic_year='').values_list('academic_year', flat=True))),
    }
    return render(request, 'student_directory.html', context)


@login_required
def student_detail(request, student_id):
    student = get_object_or_404(StudentRecord, student_id=student_id)
    score_summary = _score_for_student(student)
    risk_flags = evaluate_risk_flags(student)
    recommendations = get_recommendations(student)
    segment = detect_student_segment(student)
    context = {
        'student': student,
        'score_summary': score_summary,
        'risk_flags': risk_flags,
        'recommendations': recommendations,
        'segment': segment,
    }
    return render(request, 'student_detail.html', context)


@login_required
def upload_data(request):
    form = CSVUploadForm(request.POST or None, request.FILES or None)
    summary = None
    if request.method == 'POST' and form.is_valid():
        file = request.FILES['upload']
        try:
            storage = FileSystemStorage(location=settings.CSV_UPLOAD_DIR)
            stored_name = storage.save(file.name, file)
            summary = import_student_csv(storage.path(stored_name))
        except Exception as exc:  # pragma: no cover - validation path
            form.add_error('upload', str(exc))
    context = {'form': form, 'summary': summary}
    return render(request, 'upload.html', context)


@login_required
def risk_analysis(request):
    students = _student_queryset(request)
    rows = []
    for student in students:
        rows.append({'student': student, 'risk_flags': evaluate_risk_flags(student)})
    context = {'rows': rows, 'student_count': students.count()}
    return render(request, 'risk_analysis.html', context)


@login_required
def segmentation(request):
    students = _student_queryset(request)
    segment_summary = build_segment_summary(students)
    context = {'segment_summary': segment_summary}
    return render(request, 'segmentation.html', context)


def methodology(request):
    return render(request, 'methodology.html')


def about(request):
    return render(request, 'about.html')


@login_required
def download_template(request):
    template_path = Path(__file__).resolve().parent.parent / 'data' / 'student_template.csv'
    return FileResponse(template_path.open('rb'), as_attachment=True, filename='student_template.csv')
