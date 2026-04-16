from django.urls import path
from .views import (
    CollegeListAPIView,
    DepartmentListAPIView,
    FacultyListAPIView,
    SeminarListAPIView,
    AttendanceRecordListAPIView,
)

urlpatterns = [
    path('colleges/', CollegeListAPIView.as_view(), name='college-list'),
    path('departments/', DepartmentListAPIView.as_view(), name='department-list'),
    path('faculty/', FacultyListAPIView.as_view(), name='faculty-list'),
    path('seminars/', SeminarListAPIView.as_view(), name='seminar-list'),
    path('attendance-records/', AttendanceRecordListAPIView.as_view(), name='attendance-list'),
]
