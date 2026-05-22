import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from clinic.models import LabTestPrescription, Bill, Appointment, LabTest

print("--- Lab Test Prescriptions ---")
for lp in LabTestPrescription.objects.all():
    print(f"ID: {lp.id}, Appointment: {lp.appointment_id}, LabTest: {lp.lab_test.test_name}, Value: {repr(lp.lab_test_value)}, Remarks: {repr(lp.remarks)}, Is Active: {lp.is_active}")

print("\n--- Bills ---")
for b in Bill.objects.all():
    print(f"ID: {b.id}, Appointment: {b.appointment_id}, Total Amount: {b.total_amount}, Is Paid: {b.is_paid}")
