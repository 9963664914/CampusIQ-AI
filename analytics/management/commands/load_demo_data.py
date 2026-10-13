from pathlib import Path

from django.core.management.base import BaseCommand

from analytics.models import StudentRecord
from analytics.services.data_import import import_student_csv


class Command(BaseCommand):
    help = 'Load the synthetic CampusIQ demo dataset into SQLite.'

    def handle(self, *args, **options):
        base_path = Path(__file__).resolve().parents[3]
        sample_csv = base_path / 'data' / 'sample_students.csv'
        StudentRecord.objects.all().delete()
        summary = import_student_csv(sample_csv)
        self.stdout.write(self.style.SUCCESS(
            f'Loaded demo data: {summary["imported"]} imported, {summary["updated"]} updated, {summary["rejected"]} rejected.'
        ))
