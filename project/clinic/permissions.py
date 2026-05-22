from rest_framework.permissions import BasePermission


class IsAdministrator(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.groups.filter(name='Administrator').exists()
        )


class IsDoctor(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.groups.filter(name='Doctor').exists()
        )


class IsReceptionist(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.groups.filter(name='Receptionist').exists()
        )


class IsPharmacist(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.groups.filter(name='Pharmacist').exists()
        )


class IsLabTechnician(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.groups.filter(name='Lab Technician').exists()
        )