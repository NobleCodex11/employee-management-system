import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User, Group
from clinic.models import Staff

def main():
    print("Starting sync of Staff to Django Users...")
    for s in Staff.objects.all():
        u, created = User.objects.get_or_create(username=s.username)
        u.set_password('password')
        u.is_staff = True
        if s.role.role_name == 'Administrator':
            u.is_superuser = True
        u.save()
        
        # Add to group matching role name
        g, _ = Group.objects.get_or_create(name=s.role.role_name)
        u.groups.add(g)
        print(f"Synced user '{s.username}' -> Group '{s.role.role_name}' (Password: 'password')")

if __name__ == '__main__':
    main()
