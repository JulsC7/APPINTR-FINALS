from django.urls import path
from .views import (
  CollegeListAPIView,
  DepartmentListAPIView, DepartmentDetailAPIView,
  FacultyListAPIView, FacultyDetailAPIView,
  SeminarListAPIView, SeminarDetailAPIView,
  AttendanceRecordListAPIView, AttendanceRecordDetailAPIView,
)


urlpatterns = [
  path('colleges/', CollegeListAPIView.as_view(), name='college-list'),


  # Departments
  path('departments/', DepartmentListAPIView.as_view(), name='department-list'),
  path('departments/<int:pk>/', DepartmentDetailAPIView.as_view(), name='department-detail'),


  # Faculty
  path('faculty/', FacultyListAPIView.as_view(), name='faculty-list'),
  path('faculty/<int:pk>/', FacultyDetailAPIView.as_view(), name='faculty-detail'),


  # Others
  path('seminars/', SeminarListAPIView.as_view(), name='seminar-list'),
  path('seminars/<int:pk>/', SeminarDetailAPIView.as_view(), name='seminar-detail'),
  path('attendance-records/', AttendanceRecordListAPIView.as_view(), name='attendance-list'),
path('attendance-records/<int:pk>/', AttendanceRecordDetailAPIView.as_view(), name='attendance-detail'),
]

