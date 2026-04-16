from rest_framework import generics
from .models import (
    College,
    Department,
    Faculty,
    Seminar,
    AttendanceRecord,
)
from .serializers import (
    CollegeSerializer,
    DepartmentSerializer,
    FacultySerializer,
    SeminarSerializer,
    AttendanceRecordSerializer,
)

class CollegeListAPIView(generics.ListAPIView):
    queryset = College.objects.all().order_by('name')
    serializer_class = CollegeSerializer

class DepartmentListAPIView(generics.ListAPIView):
    # Loads the linked college efficiently
    queryset = Department.objects.select_related('college').all().order_by('name')
    serializer_class = DepartmentSerializer

class FacultyListAPIView(generics.ListAPIView):
    # Efficiently loads the department (and the department's college, if applicable)
    queryset = Faculty.objects.select_related(
        'department',
        'department__college'
    ).all().order_by('last_name', 'first_name')
    serializer_class = FacultySerializer

class SeminarListAPIView(generics.ListAPIView):
    queryset = Seminar.objects.all().order_by('-date')
    serializer_class = SeminarSerializer

class AttendanceRecordListAPIView(generics.ListAPIView):
    # Efficiently loads both the faculty member and the seminar details
    queryset = AttendanceRecord.objects.select_related(
        'faculty',
        'seminar'
    ).all().order_by('-time_logged')
    serializer_class = AttendanceRecordSerializer
