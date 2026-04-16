from django.db import models


class College(models.Model):
    name = models.CharField(max_length=150, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=150)
    # Made optional (blank=True, null=True) so non-academic departments (HR, Library) can exist
    college = models.ForeignKey(
        College,
        on_delete=models.PROTECT,
        related_name='departments',
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'college')
        ordering = ['name']

    def __str__(self):
        if self.college:
            return f"{self.name} - {self.college.name}"
        return self.name


class Faculty(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    employee_number = models.CharField(max_length=50, unique=True)
    last_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    middle_initial = models.CharField(max_length=10, blank=True, null=True)

    birthdate = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)

    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='faculty_members')

    # PSGC Address Codes
    region_code = models.CharField(max_length=20, blank=True, null=True)
    province_code = models.CharField(max_length=20, blank=True, null=True)
    city_municipality_code = models.CharField(max_length=20, blank=True, null=True)
    barangay_code = models.CharField(max_length=20, blank=True, null=True)
    street_address = models.CharField(max_length=255, blank=True, null=True)

    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    photo = models.ImageField(upload_to='faculty/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Auto-updates on edit

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.employee_number} - {self.last_name}, {self.first_name}"


class Seminar(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    location = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.date})"


class AttendanceRecord(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='attendances')
    seminar = models.ForeignKey(Seminar, on_delete=models.CASCADE, related_name='attendances')
    time_logged = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('faculty', 'seminar')

    def __str__(self):
        return f"{self.faculty.last_name} attended {self.seminar.title}"