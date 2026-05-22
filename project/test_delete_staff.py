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
from clinic.models import Staff, Role, Doctor

def run_test():
    print("--- Starting Staff Deletion Integration Tests ---")

    # 1. Create a temporary admin user for API access
    admin_user, created_admin = User.objects.get_or_create(username='admin_test_delete', is_superuser=True, is_staff=True)
    if created_admin:
        admin_user.set_password('pass123')
        admin_user.save()

    client = APIClient()
    client.force_authenticate(user=admin_user)

    # 2. Get or create a Role for the staff member
    role_obj, _ = Role.objects.get_or_create(role_name='Doctor')

    # 3. Create a test Staff member
    username = 'test_staff_delete_1'
    # Delete if already exists to ensure clean start
    Staff.objects.filter(username=username).delete()
    User.objects.filter(username=username).delete()

    print("\n--- Step 1: Creating a test staff member ---")
    staff_member = Staff.objects.create(
        full_name='Dr. Test Deletable',
        gender='Male',
        joining_date='2026-05-22',
        mobile_number='1234567890',
        username=username,
        password='password_test_123',
        role=role_obj,
        is_active=True
    )
    print(f"Created Staff: ID={staff_member.id}, Name={staff_member.full_name}, Username={staff_member.username}")

    # The Django auth user should be automatically created via post_save signal
    django_user = User.objects.filter(username=username).first()
    assert django_user is not None, "Django auth user was not created via post_save signal!"
    print(f"Verified: Django auth user '{username}' exists.")

    # The Doctor profile should be automatically created via post_save signal (since role is 'Doctor')
    doctor_profile = Doctor.objects.filter(staff=staff_member).first()
    assert doctor_profile is not None, "Doctor profile was not created via post_save signal!"
    print(f"Verified: Doctor profile exists for Staff ID {staff_member.id}.")

    # 4. Perform DELETE request via API
    print("\n--- Step 2: Sending DELETE request to /api/staff/{id}/ ---")
    res = client.delete(f'/api/staff/{staff_member.id}/')
    assert res.status_code == 204, f"Delete endpoint failed with status {res.status_code}: {res.content}"
    print(f"Received expected status 204 No Content.")

    # 5. Verify records are completely deleted
    print("\n--- Step 3: Verifying all records are deleted ---")
    staff_exists = Staff.objects.filter(id=staff_member.id).exists()
    django_user_exists = User.objects.filter(username=username).exists()
    doctor_exists = Doctor.objects.filter(staff=staff_member).exists()

    print(f"Staff exists in DB: {staff_exists} (Expected: False)")
    print(f"Django auth user exists in DB: {django_user_exists} (Expected: False)")
    print(f"Doctor profile exists in DB: {doctor_exists} (Expected: False)")

    assert not staff_exists, "Staff record still exists in DB!"
    assert not django_user_exists, "Django auth user still exists in DB!"
    assert not doctor_exists, "Doctor profile still exists in DB!"

    # Clean up test admin user
    if created_admin:
        admin_user.delete()
        print("\nCleaned up temporary admin user.")

    print("\n--- ALL STAFF DELETION TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    run_test()
