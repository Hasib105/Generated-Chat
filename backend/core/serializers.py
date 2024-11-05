from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from core.models import User  

# Serializer for User Registration
class UserRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, min_length=8)
    retype_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])  
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        user.save()
        return user

    def validate(self, attrs):
        if attrs['password'] != attrs['retype_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

# Serializer for User Login
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        user = User.objects(username=attrs['username']).first()
        if user and check_password(attrs['password'], user.password):
            return user
        raise serializers.ValidationError("Invalid username or password.")