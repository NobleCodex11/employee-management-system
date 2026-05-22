import os
import sys
import django

sys.path.append(r"c:\Users\arjun\Downloads\project\project")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from clinic.views import dashboard_stats
from django.test import RequestFactory
from django.contrib.auth.models import User

rf = RequestFactory()
request = rf.get('/api/dashboard/stats/')
request.user = User.objects.first() or User(username='test')

try:
    response = dashboard_stats(request)
    print("STATUS:", response.status_code)
    print("CONTENT:", response.data)
except Exception as e:
    import traceback
    print("EXCEPTION:", traceback.format_exc())
