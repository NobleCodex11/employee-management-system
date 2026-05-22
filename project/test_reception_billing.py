import os
import sys
import django

# Setup Django environment
sys.path.append(r"c:\Users\noble\Desktop\project\project")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

from django.contrib.auth.models import User
from rest_framework.test import APIClient
from clinic.models import Patient, Appointment, Bill

def run_test():
    print("--- Starting Reception Billing Integration Tests ---")

    # Force authenticate with temporary admin/receptionist
    user, created = User.objects.get_or_create(username='receptionist_test', is_superuser=True, is_staff=True)
    if created:
        user.set_password('pass123')
        user.save()

    client = APIClient()
    client.force_authenticate(user=user)

    # 1. Test Patient API Serializer
    print("\n--- Step 1: Testing Patient Serialization ---")
    res = client.get('/api/patients/')
    assert res.status_code == 200, f"Patient API failed with status {res.status_code}"
    patients_data = res.data
    assert len(patients_data) > 0, "No patients found in DB to test serialization!"
    
    first_patient = patients_data[0]
    print(f"Patient name: {first_patient['patient_name']}")
    assert 'total_bill' in first_patient, "total_bill missing in PatientSerializer"
    assert 'outstanding_bill' in first_patient, "outstanding_bill missing in PatientSerializer"
    print(f"  total_bill: {first_patient['total_bill']}")
    print(f"  outstanding_bill: {first_patient['outstanding_bill']}")

    # 2. Test Appointment API Serializer
    print("\n--- Step 2: Testing Appointment Serialization ---")
    res = client.get('/api/appointments/')
    assert res.status_code == 200, f"Appointment API failed with status {res.status_code}"
    appointments_data = res.data
    assert len(appointments_data) > 0, "No appointments found in DB to test serialization!"
    
    first_appt = appointments_data[0]
    print(f"Appointment ID: {first_appt['id']}")
    assert 'bill_amount' in first_appt, "bill_amount missing in AppointmentSerializer"
    assert 'bill_status' in first_appt, "bill_status missing in AppointmentSerializer"
    print(f"  bill_amount: {first_appt['bill_amount']}")
    print(f"  bill_status: {first_appt['bill_status']}")

    # Let's find an appointment with an unpaid bill, or create one for testing
    appt_id = first_appt['id']
    appt_obj = Appointment.objects.get(id=appt_id)
    bill, bill_created = Bill.objects.get_or_create(appointment=appt_obj)
    bill.total_amount = 55.50
    bill.is_paid = False
    bill.save()

    # Re-fetch appointments to verify unpaid bill status
    res = client.get('/api/appointments/')
    appt_data = [a for a in res.data if a['id'] == appt_id][0]
    assert appt_data['bill_status'] == 'Unpaid', f"Expected Unpaid status, got {appt_data['bill_status']}"
    assert appt_data['bill_amount'] == 55.50, f"Expected bill_amount 55.50, got {appt_data['bill_amount']}"

    # 3. Test Pay Bill Endpoint
    print("\n--- Step 3: Testing Pay Bill Endpoint ---")
    res = client.post(f'/api/appointments/{appt_id}/pay-bill/')
    assert res.status_code == 200, f"Pay bill endpoint failed with status {res.status_code}"
    print(f"Pay bill response: {res.data}")
    assert res.data['is_paid'] is True, "is_paid should be True after payment"

    # Re-fetch to ensure serialization matches the paid state
    res = client.get('/api/appointments/')
    appt_data = [a for a in res.data if a['id'] == appt_id][0]
    assert appt_data['bill_status'] == 'Paid', f"Expected Paid status, got {appt_data['bill_status']}"

    # Clean up test user & temporary bill settings
    if bill_created:
        bill.delete()
    else:
        bill.total_amount = 0.00
        bill.is_paid = False
        bill.save()
    
    if created:
        user.delete()

    print("\n--- ALL RECEPTION BILLING TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    run_test()
