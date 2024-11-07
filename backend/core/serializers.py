from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from core.models import User, ChatThread, ChatMessage

# Serializer for User Registration
class UserRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, min_length=8)
    retype_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        if attrs['password'] != attrs['retype_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('retype_password')  
        user = User(**validated_data)  
        user.clean()  
        user.save()  
        return user

# Serializer for User Login
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid username or password.")
    
        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid username or password.")

        return user


class UserSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    created_at = serializers.DateTimeField()



class ChatThreadSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    slug = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)
    created_at = serializers.DateTimeField()

class ChatMessageSerializer(serializers.Serializer):
    thread = ChatThreadSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    message = serializers.CharField()
    response = serializers.CharField()
    timestamp = serializers.DateTimeField()
    slug = serializers.CharField(read_only=True)