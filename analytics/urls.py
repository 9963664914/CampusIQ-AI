from django.urls import path

from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('students/', views.student_directory, name='student_directory'),
    path('students/<str:student_id>/', views.student_detail, name='student_detail'),
    path('upload/', views.upload_data, name='upload_data'),
    path('download-template/', views.download_template, name='download_template'),
    path('risk-analysis/', views.risk_analysis, name='risk_analysis'),
    path('segmentation/', views.segmentation, name='segmentation'),
    path('methodology/', views.methodology, name='methodology'),
    path('about/', views.about, name='about'),
]
