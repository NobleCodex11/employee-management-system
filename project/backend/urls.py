"""
URL configuration for backend project.
"""

from django.contrib import admin
from django.urls import path, include

# JWT imports
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    # Admin Panel
    path('admin/', admin.site.urls),

    # JWT Authentication APIs
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Clinic APIs
    path('api/', include('clinic.urls')),
]