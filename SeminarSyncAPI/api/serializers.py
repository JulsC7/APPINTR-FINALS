from rest_framework import serializers
from .models import College, Department, Faculty, Seminar, AttendanceRecord

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    # Safe check in case a department doesn't have a college (like Admin or HR)
    college_name = serializers.CharField(source='college.name', read_only=True, default="N/A")

    class Meta:
        model = Department
        fields = [
            'id',
            'name',
            'college',
            'college_name'
        ]

class FacultySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Faculty
        fields = [
            'id',
            'employee_number',
            'last_name',
            'first_name',
            'middle_initial',
            'birthdate',
            'gender',
            'department',
            'department_name',
            'region_code',
            'province_code',
            'city_municipality_code',
            'barangay_code',
            'street_address',
            'email',
            'phone',
            'photo',
            'created_at',
            'updated_at',
        ]

class SeminarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seminar
        fields = '__all__'

class AttendanceRecordSerializer(serializers.ModelSerializer):
    faculty_last_name = serializers.CharField(source='faculty.last_name', read_only=True)
    faculty_employee_number = serializers.CharField(source='faculty.employee_number', read_only=True)
    seminar_title = serializers.CharField(source='seminar.title', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'faculty',
            'faculty_last_name',
            'faculty_employee_number',
            'seminar',
            'seminar_title',
            'time_logged',
        ]