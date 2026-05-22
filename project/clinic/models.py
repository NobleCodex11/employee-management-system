from django.db import models

class Role(models.Model):
    role_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.role_name

class Staff(models.Model):
    full_name = models.CharField(max_length=200)
    gender = models.CharField(max_length=10)
    joining_date = models.DateField()
    mobile_number = models.CharField(max_length=15)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=128)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.full_name

class Specialization(models.Model):
    specialization_name = models.CharField(max_length=100)

    def __str__(self):
        return self.specialization_name

class Doctor(models.Model):
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    specialization = models.ForeignKey(Specialization, on_delete=models.SET_NULL, null=True)
    staff = models.OneToOneField(Staff, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.staff.full_name}"

class Membership(models.Model):
    membership_type = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.membership_type

class Patient(models.Model):
    patient_name = models.CharField(max_length=200)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    mobile_number = models.CharField(max_length=15)
    address = models.TextField()
    membership = models.ForeignKey(Membership, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.patient_name

class Appointment(models.Model):
    appointment_date = models.DateTimeField()
    token_number = models.IntegerField()
    consultation_status = models.CharField(max_length=50, default='Scheduled')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Appointment {self.id} for {self.patient.patient_name}"

class Consultation(models.Model):
    symptoms = models.TextField()
    diagnosis = models.TextField()
    notes = models.TextField(blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

class MedicineCategory(models.Model):
    category_name = models.CharField(max_length=100)

    def __str__(self):
        return self.category_name

class Medicine(models.Model):
    medicine_name = models.CharField(max_length=200)
    manufacturing_date = models.DateField()
    expiry_date = models.DateField()
    unit = models.CharField(max_length=50)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    category = models.ForeignKey(MedicineCategory, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.medicine_name

class MedicinePrescription(models.Model):
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    is_dispensed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

class LabTestCategory(models.Model):
    category_name = models.CharField(max_length=100)

    def __str__(self):
        return self.category_name

class LabTest(models.Model):
    test_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reference_min_range = models.CharField(max_length=50, blank=True)
    reference_max_range = models.CharField(max_length=50, blank=True)
    sample_required = models.CharField(max_length=100)
    category = models.ForeignKey(LabTestCategory, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.test_name

class LabTestPrescription(models.Model):
    lab_test = models.ForeignKey(LabTest, on_delete=models.CASCADE)
    lab_test_value = models.CharField(max_length=100, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

class MedicineStock(models.Model):
    stock_in_hand = models.IntegerField(default=0)
    re_order_level = models.IntegerField(default=10)
    purchase = models.IntegerField(default=0)
    issuance = models.IntegerField(default=0)
    medicine = models.OneToOneField(Medicine, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=Staff)
def sync_staff_to_django_user(sender, instance, created, **kwargs):
    from django.contrib.auth.models import User, Group
    
    # 1. Get or create Django Auth User
    u, user_created = User.objects.get_or_create(username=instance.username)
    
    # 2. Update Auth User attributes (password gets securely hashed)
    u.set_password(instance.password)
    u.is_staff = True
    if instance.role.role_name == 'Administrator':
        u.is_superuser = True
    else:
        u.is_superuser = False
    u.is_active = instance.is_active
    u.save()
    
    # 3. Synchronize Role/Group Membership
    g, _ = Group.objects.get_or_create(name=instance.role.role_name)
    u.groups.clear()
    u.groups.add(g)

@receiver(post_delete, sender=Staff)
def delete_django_user(sender, instance, **kwargs):
    from django.contrib.auth.models import User
    try:
        u = User.objects.get(username=instance.username)
        u.delete()
    except User.DoesNotExist:
        pass

@receiver(post_save, sender=Staff)
def create_doctor_profile(sender, instance, created, **kwargs):
    if created and instance.role.role_name == 'Doctor':
        Doctor.objects.get_or_create(staff=instance, defaults={'consultation_fee': 0.00})

class Notification(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.doctor.staff.full_name}"

class Bill(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_paid = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill for Appointment {self.appointment.id}"
