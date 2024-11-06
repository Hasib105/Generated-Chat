# custom_auth.py
from mongoengine import DoesNotExist
from core.models import User  
from django.contrib.auth.backends import BaseBackend

class MongoBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):  
                return user
        except DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except DoesNotExist:
            return None
