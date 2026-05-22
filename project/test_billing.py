import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

from django.contrib.auth.models import User
from rest_framework.test import APIClient
from clinic.models import LabTestPrescription, Bill, Appointment, LabTest

def run_test():
    print("--- Starting Billing & Evaluation Tests ---")

    # Get or create superuser for API client authentication
    user, created = User.objects.get_or_create(username='admin_test', is_superuser=True, is_staff=True)
    if created:
        user.set_password('adminpass123')
        user.save()
        print("Created temporary admin user.")

    client = APIClient()
    client.force_authenticate(user=user)

    # Let's find or create a mock lab test and appointment
    lab_test = LabTest.objects.first()
    if not lab_test:
        print("No Lab Tests found in the database. Please ensure you run seed_data.py first.")
        return
    
    # We will find an existing appointment or create a mock one
    appointment = Appointment.objects.first()
    if not appointment:
        print("No appointments found in the database. Please ensure you run seed_data.py first.")
        return

    # Create a fresh pending prescription
    prescription = LabTestPrescription.objects.create(
        appointment=appointment,
        lab_test=lab_test,
        remarks="Doctor note: Fasting required",
        is_active=True
    )
    pres_id = prescription.id
    print(f"Created pending LabTestPrescription ID: {pres_id} (doctor remarks: {repr(prescription.remarks)})")

    # Verify that there's no pre-existing Bill total issue
    bill, _ = Bill.objects.get_or_create(appointment=appointment)
    initial_bill_amount = float(bill.total_amount)
    print(f"Initial Bill total: ${initial_bill_amount:.2f}")

    # 1. First evaluation: Awaiting evaluation -> Evaluated
    print("\n--- Step 1: Submitting First Evaluation ---")
    response = client.post(f'/api/prescriptions/labtest/{pres_id}/evaluate/', {
        'lab_test_value': '85',
        'remarks': 'Fasting blood sugar within normal limits'
    }, format='json')

    if response.status_code != 200:
        print(f"ERROR: First evaluation failed with status {response.status_code}, content: {response.data}")
        return

    print("Success response:", response.data)
    
    # Fetch updated prescription and bill
    prescription.refresh_from_db()
    bill.refresh_from_db()
    
    expected_amount_after_first = initial_bill_amount + float(lab_test.amount)
    actual_amount_after_first = float(bill.total_amount)
    
    print(f"Prescription Value: {prescription.lab_test_value}")
    print(f"Prescription Remarks: {prescription.remarks}")
    print(f"Bill total after first evaluation: ${actual_amount_after_first:.2f} (Expected: ${expected_amount_after_first:.2f})")
    
    assert actual_amount_after_first == expected_amount_after_first, "First billing amount mismatch!"

    # 2. Second evaluation: Edit existing evaluation
    print("\n--- Step 2: Modifying/Editing Evaluation ---")
    response = client.post(f'/api/prescriptions/labtest/{pres_id}/evaluate/', {
        'lab_test_value': '92',
        'remarks': 'Fasting blood sugar slightly elevated but normal'
    }, format='json')

    if response.status_code != 200:
        print(f"ERROR: Edit evaluation failed with status {response.status_code}, content: {response.data}")
        return

    print("Success response:", response.data)

    # Fetch updated prescription and bill again
    prescription.refresh_from_db()
    bill.refresh_from_db()

    actual_amount_after_second = float(bill.total_amount)
    print(f"Updated Prescription Value: {prescription.lab_test_value}")
    print(f"Updated Prescription Remarks: {prescription.remarks}")
    print(f"Bill total after edit: ${actual_amount_after_second:.2f} (Expected: ${expected_amount_after_first:.2f} - no double billing)")

    assert actual_amount_after_second == expected_amount_after_first, f"Double-billing detected! Bill amount got incremented again to ${actual_amount_after_second:.2f}"
    
    # 3. Clean up
    prescription.delete()
    # Reset bill to initial amount for clean state
    bill.total_amount = initial_bill_amount
    bill.save()
    if created:
        user.delete()
        print("Cleaned up temporary admin user.")

    print("\n--- ALL TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    run_test()
