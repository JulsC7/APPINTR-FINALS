from rest_framework import generics
from .models import College,
                    Department, 
                    Faculty, 
                    Seminar,     
                    AttendanceRecord
from .serializers import (
   CollegeSerializer, 
    DepartmentSerializer, 
    FacultySerializer,
    SeminarSerializer, 
    AttendanceRecordSerializer
)


# --- LIST & CREATE VIEWS ---
class CollegeListAPIView(generics.ListCreateAPIView):
   queryset = College.objects.all().order_by('name')
   serializer_class = CollegeSerializer


class DepartmentListAPIView(generics.ListCreateAPIView):
   queryset = Department.objects.select_related('college').all().order_by('name')
   serializer_class = DepartmentSerializer


class FacultyListAPIView(generics.ListCreateAPIView):
   queryset = Faculty.objects.select_related('department', 'department__college').all().order_by('last_name', 'first_name')
   serializer_class = FacultySerializer


class SeminarListAPIView(generics.ListCreateAPIView):
   queryset = Seminar.objects.all().order_by('-date')
   serializer_class = SeminarSerializer


class AttendanceRecordListAPIView(generics.ListCreateAPIView):
   queryset = AttendanceRecord.objects.select_related('faculty', 'seminar').all().order_by('-time_logged')
   serializer_class = AttendanceRecordSerializer


# --- DETAIL, EDIT & DELETE VIEWS ---
class DepartmentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
   queryset = Department.objects.all()
   serializer_class = DepartmentSerializer


class FacultyDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
   queryset = Faculty.objects.all()
   serializer_class = FacultySerializer
