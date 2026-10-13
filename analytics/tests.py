from pathlib import Path
from tempfile import TemporaryDirectory

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, TestCase, override_settings
from django.contrib.auth import get_user_model

from analytics.models import StudentRecord
from analytics.services.scoring import calculate_student_score
from analytics.services.risk_analysis import evaluate_risk_flags
from analytics.services.segmentation import detect_student_segment
from analytics.services.recommendations import get_recommendations
from analytics.services.data_import import validate_student_rows


class ScoreCalculationTests(SimpleTestCase):
    def test_score_calculation_ranges_and_weights(self):
        payload = {
            'student_id': 'S001',
            'academic_score': 88,
            'attendance': 92,
            'lms_engagement': 80,
            'placement_readiness': 74,
            'technical_skills': 81,
            'communication_score': 76,
            'engagement_score': 72,
            'feedback_score': 69,
        }
        result = calculate_student_score(payload)
        self.assertGreaterEqual(result['score'], 0)
        self.assertLessEqual(result['score'], 100)
        self.assertEqual(result['coverage'], 1.0)
        self.assertIn('academic', result['component_scores'])

    def test_missing_component_renormalizes_without_zeroing(self):
        payload = {
            'student_id': 'S002',
            'academic_score': 82,
            'attendance': 88,
            'lms_engagement': None,
            'placement_readiness': 70,
            'technical_skills': 75,
            'communication_score': None,
            'engagement_score': 80,
            'feedback_score': 68,
        }
        result = calculate_student_score(payload)
        self.assertGreater(result['score'], 0)
        self.assertLess(result['coverage'], 1.0)
        self.assertIn('missing_components', result)


class RiskAndSegmentationTests(SimpleTestCase):
    def test_academic_risk_uses_thresholds(self):
        student = {
            'student_id': 'S003',
            'attendance': 68,
            'academic_score': 54,
        }
        flags = evaluate_risk_flags(student)
        self.assertTrue(any(item['type'] == 'academic' for item in flags))

    def test_segmentation_detects_multiple_support_signals(self):
        student = {
            'student_id': 'S004',
            'attendance': 65,
            'academic_score': 52,
            'placement_readiness': 48,
            'technical_skills': 61,
            'communication_score': 58,
        }
        segment = detect_student_segment(student)
        self.assertIsNotNone(segment)

    def test_recommendations_are_actionable(self):
        student = {
            'student_id': 'S005',
            'attendance': 62,
            'academic_score': 55,
            'lms_engagement': 35,
            'aptitude_score': 44,
        }
        recommendations = get_recommendations(student)
        self.assertTrue(recommendations)
        self.assertIn('support', ' '.join(recommendations).lower())


class DataImportTests(SimpleTestCase):
    def test_csv_validation_identifies_invalid_rows(self):
        rows = [
            {'student_id': 'A100', 'name': 'Aisha', 'department': 'CSE', 'attendance': '92', 'academic_score': '85'},
            {'student_id': 'A100', 'name': 'Aisha Duplicate', 'department': 'CSE', 'attendance': '90', 'academic_score': '80'},
            {'student_id': 'A101', 'name': 'Ishita', 'department': 'ECE', 'attendance': 'abc', 'academic_score': '72'},
        ]
        result = validate_student_rows(rows)
        self.assertEqual(result['duplicate_ids'], ['A100'])
        self.assertTrue(result['invalid_rows'])


class DashboardAccessTests(TestCase):
    def test_dashboard_renders(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 302)


class AuthenticationFlowTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='demo_user',
            email='demo@campusiq.ai',
            password='SecurePass123!'
        )

    def test_dashboard_requires_login(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 302)
        self.assertIn('/accounts/login/', response.url)

    def test_valid_login_redirects_to_dashboard(self):
        response = self.client.post('/accounts/login/', {
            'username': 'demo_user',
            'password': 'SecurePass123!'
        }, follow=True)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Dashboard')
        self.assertIn('_auth_user_id', self.client.session)

    def test_login_preserves_protected_page_destination(self):
        protected_response = self.client.get('/students/')
        login_page = self.client.get(protected_response.url)

        self.assertContains(login_page, 'name="next"')

        response = self.client.post('/accounts/login/', {
            'username': 'demo_user',
            'password': 'SecurePass123!',
            'next': login_page.context['next'],
        })
        self.assertRedirects(response, '/students/', fetch_redirect_response=False)

    def test_invalid_login_displays_error(self):
        response = self.client.post('/accounts/login/', {
            'username': 'demo_user',
            'password': 'wrong-password'
        }, follow=True)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Please enter a correct username and password')

    def test_logout_clears_session(self):
        self.client.login(username='demo_user', password='SecurePass123!')
        response = self.client.post('/accounts/logout/', follow=True)

        self.assertEqual(response.status_code, 200)
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_default_csv_upload_dir_is_configured(self):
        self.assertTrue(hasattr(settings, 'CSV_UPLOAD_DIR'))
        self.assertTrue(Path(settings.CSV_UPLOAD_DIR).exists())

    def test_csv_upload_is_stored_locally_and_imported(self):
        self.client.login(username='demo_user', password='SecurePass123!')
        upload_content = b'student_id,name,department,attendance,academic_score\nLOCAL-01,Local Student,CSE,91,86\n'

        with TemporaryDirectory() as upload_dir:
            with override_settings(CSV_UPLOAD_DIR=Path(upload_dir)):
                response = self.client.post('/upload/', {
                    'upload': SimpleUploadedFile('students.csv', upload_content, content_type='text/csv')
                })

            self.assertEqual(response.status_code, 200)
            self.assertContains(response, 'Imported:</strong> 1')
            self.assertEqual(len(list(Path(upload_dir).iterdir())), 1)
            self.assertTrue(StudentRecord.objects.filter(student_id='LOCAL-01').exists())

    def test_non_csv_upload_is_rejected_before_storage(self):
        self.client.login(username='demo_user', password='SecurePass123!')

        with TemporaryDirectory() as upload_dir:
            with override_settings(CSV_UPLOAD_DIR=Path(upload_dir)):
                response = self.client.post('/upload/', {
                    'upload': SimpleUploadedFile('students.txt', b'not a csv')
                })

            self.assertEqual(response.status_code, 200)
            self.assertContains(response, 'Upload a file with the .csv extension.')
            self.assertEqual(list(Path(upload_dir).iterdir()), [])
