from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from core.serializers import UserRegisterSerializer, UserLoginSerializer
from django.contrib.auth import logout
from rest_framework.permissions import AllowAny

class ExampleView(APIView):
    def get(self, request):
        data = {"message": "Hello from Django!"}
        return Response(data)


class ExampleView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        data = {"message": "Hello from Django!"}
        return Response(data)


class UserRegisterView(generics.CreateAPIView):
    """View for user registration."""
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]  # Allow anyone to register


class UserLoginView(generics.GenericAPIView):
    """View for user login."""
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        # Generate a token or session for the user (if needed)
        return Response({"username": user.username, "message": "Login successful."}, status=status.HTTP_200_OK)


class UserLogoutView(APIView):
    """View for user logout."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logout(request)  # Clear the session if using Django sessions
        return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)