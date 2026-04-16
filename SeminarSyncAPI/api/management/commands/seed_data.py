from django.core.management.base import BaseCommand
from api.models import College, Department, Faculty, Seminar, AttendanceRecord
from datetime import date


class Command(BaseCommand):
    help = "Insert SeminarSync normalized demo seed data"

    def handle(self, *args, **kwargs):
        # -------------------------
        # COLLEGES
        # -------------------------
        colleges = ["College of Computer Studies", "College of Business Administration"]
        college_objs = {}

        for college_name in colleges:
            obj, created = College.objects.get_or_create(
                name=college_name
            )
            college_objs[college_name] = obj

        self.stdout.write(self.style.SUCCESS("Colleges inserted"))

        # -------------------------
        # DEPARTMENTS
        # -------------------------
        departments = [
            {"name": "Information Technology Department", "college": "College of Computer Studies"},
            {"name": "Computer Science Department", "college": "College of Computer Studies"},
            {"name": "Management Department", "college": "College of Business Administration"},
            {"name": "Library", "college": None},  # Non-academic
            {"name": "Human Resources", "college": None},  # Non-academic
        ]

        department_objs = {}
        for d in departments:
            college_obj = college_objs[d["college"]] if d["college"] else None
            obj, created = Department.objects.get_or_create(
                name=d["name"],
                defaults={"college": college_obj}
            )
            key = f"{d['name']}|{d['college']}"
            department_objs[key] = obj

        self.stdout.write(self.style.SUCCESS("Departments inserted"))

        # -------------------------
        # FACULTY (Localized PSGC - Region 4A / Cavite / Kawit)
        # -------------------------
        faculty_members = [
            {
                "employee_number": "FAC-0001",
                "last_name": "Lopez",
                "first_name": "Maria",
                "middle_initial": "L",
                "birthdate": "1985-04-12",
                "gender": "Female",
                "department_name": "Information Technology Department",
                "department_college": "College of Computer Studies",
                "region_code": "040000000",  # Region IV-A (Calabarzon)
                "province_code": "042100000",  # Cavite
                "city_municipality_code": "042111000",  # Kawit
                "barangay_code": "042111001",  # Poblacion
                "street_address": "7 Aguinaldo Shrine Avenue",
                "email": "maria.lopez@example.com",
                "phone": "09980000001",
            },
            {
                "employee_number": "FAC-0002",
                "last_name": "Mendoza",
                "first_name": "Pedro",
                "middle_initial": "R",
                "birthdate": "1989-08-03",
                "gender": "Male",
                "department_name": "Library",
                "department_college": None,
                "region_code": "040000000",
                "province_code": "042100000",
                "city_municipality_code": "042111000",
                "barangay_code": "042111005",  # Gahak
                "street_address": "54 Centennial Road",
                "email": "pedro.mendoza@example.com",
                "phone": "09980000002",
            },
            {
                "employee_number": "FAC-0003",
                "last_name": "Castro",
                "first_name": "Carlo",
                "middle_initial": "T",
                "birthdate": "1992-12-19",
                "gender": "Male",
                "department_name": "Management Department",
                "department_college": "College of Business Administration",
                "region_code": "040000000",
                "province_code": "042100000",
                "city_municipality_code": "042111000",
                "barangay_code": "042111012",  # Wakas
                "street_address": "9 Tirona Highway",
                "email": "carlo.castro@example.com",
                "phone": "09980000003",
            },
        ]

        faculty_objs = []
        for f in faculty_members:
            dept_key = f"{f['department_name']}|{f['department_college']}"
            obj, created = Faculty.objects.get_or_create(
                employee_number=f["employee_number"],
                defaults={
                    "last_name": f["last_name"],
                    "first_name": f["first_name"],
                    "middle_initial": f["middle_initial"],
                    "birthdate": f["birthdate"],
                    "gender": f["gender"],
                    "department": department_objs[dept_key],
                    "region_code": f["region_code"],
                    "province_code": f["province_code"],
                    "city_municipality_code": f["city_municipality_code"],
                    "barangay_code": f["barangay_code"],
                    "street_address": f["street_address"],
                    "email": f["email"],
                    "phone": f["phone"],
                }
            )
            faculty_objs.append(obj)

        self.stdout.write(self.style.SUCCESS("Faculty inserted"))

        # -------------------------
        # SEMINARS
        # -------------------------
        seminars = [
            {
                "title": "Data Privacy Act Compliance Training",
                "description": "Mandatory seminar for all teaching and non-teaching staff.",
                "date": date(2026, 6, 1),
                "location": "Main Auditorium",
            },
            {
                "title": "Advanced Pedagogy for IT Educators",
                "description": "Specialized training for CCS faculty.",
                "date": date(2026, 6, 15),
                "location": "Computer Lab 1",
            },
        ]

        seminar_objs = []
        for s in seminars:
            obj, created = Seminar.objects.get_or_create(
                title=s["title"],
                defaults={
                    "description": s["description"],
                    "date": s["date"],
                    "location": s["location"],
                }
            )
            seminar_objs.append(obj)

        self.stdout.write(self.style.SUCCESS("Seminars inserted"))

        # -------------------------
        # ATTENDANCE RECORDS
        # -------------------------
        # Maria and Pedro attended Data Privacy
        AttendanceRecord.objects.get_or_create(faculty=faculty_objs[0], seminar=seminar_objs[0])
        AttendanceRecord.objects.get_or_create(faculty=faculty_objs[1], seminar=seminar_objs[0])

        # Maria and Carlo attended Advanced Pedagogy
        AttendanceRecord.objects.get_or_create(faculty=faculty_objs[0], seminar=seminar_objs[1])
        AttendanceRecord.objects.get_or_create(faculty=faculty_objs[2], seminar=seminar_objs[1])

        self.stdout.write(self.style.SUCCESS("Attendance records inserted"))
        self.stdout.write(self.style.SUCCESS("DONE"))