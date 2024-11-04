from mongoengine import Document, StringField, EmailField, DateTimeField, ValidationError, connect
from datetime import datetime
from django.conf import settings
from rest_framework import serializers, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import logout
import os


# MongoDB configuration
MONGO_DB_CONFIG = {
    'NAME': os.environ.get('MONGO_DB_NAME'),
    'USER': os.environ.get('MONGO_DB_USER'),
    'PASSWORD': os.environ.get('MONGO_DB_PASSWORD'),
    'HOST': os.environ.get('MONGO_DB_HOST'),
    'PORT': os.environ.get('MONGO_DB_PORT'),
}

# Connect to MongoDB using MongoEngine
if all(MONGO_DB_CONFIG.values()):
    connect(
        db=MONGO_DB_CONFIG['NAME'],
        username=MONGO_DB_CONFIG['USER'],
        password=MONGO_DB_CONFIG['PASSWORD'],
        host=MONGO_DB_CONFIG['HOST'],
        port=int(MONGO_DB_CONFIG['PORT']),
        authentication_source='admin'
    )
else:
    raise ValueError("MongoDB configuration is incomplete.")


# MongoEngine User Model
class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)  
    created_at = DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return self.username

    def clean(self):
        """Custom validation logic."""
        if len(self.password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")