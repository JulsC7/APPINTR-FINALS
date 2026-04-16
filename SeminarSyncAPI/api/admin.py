from django.contrib import admin
from .models import (
    College,
    Department,
    Faculty,
    Seminar,
    AttendanceRecord,
)

@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    search_fields = ('name',)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'college', 'created_at')
    # Using 'college__name' allows searching by the college's text name instead of ID
    search_fields = ('name', 'college__name')
    list_filter = ('college',)

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'employee_number',
        'last_name',
        'first_name',
        'middle_initial',
        'department',
        'gender',
        'email',
        'phone',
        'updated_at',
    )
    search_fields = (
        'employee_number',
        'last_name',
        'first_name',
        'email',
        'phone',
        'department__name',
    )
    list_filter = (
        'department',
        'gender',
    )

@admin.register(Seminar)
class SeminarAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'date', 'location', 'created_at')
    search_fields = ('title', 'location', 'description')
    list_filter = ('date',)

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'faculty', 'seminar', 'time_logged')
    search_fields = (
        'faculty__last_name',
        'faculty__first_name',
        'faculty__employee_number',
        'seminar__title'
    )
    list_filter = ('seminar', 'time_logged')