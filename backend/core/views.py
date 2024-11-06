from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from core.serializers import UserRegisterSerializer, UserLoginSerializer , UserSerializer , ChatThreadSerializer, ChatMessageSerializer
from django.contrib.auth import logout
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.models import User, ChatThread, ChatMessage
from rest_framework_simplejwt.tokens import RefreshToken
import os
from groq import Groq



class ExampleView(APIView):
    def get(self, request):
        data = {"message": "Hello from Django!"}
        return Response(data)



class UserRegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]  # Allow anyone to register


class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "username": user.username,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ThreadListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        print(request.user)
        threads = ChatThread.objects.filter(user=request.user)
        serializer = ChatThreadSerializer(threads, many=True)
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get('title')
        if not title:
            return Response({'error': 'Title is required.'}, status=status.HTTP_400_BAD_REQUEST)

        thread = ChatThread.objects.create(title=title, user=request.user)
        serializer = ChatThreadSerializer(thread)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageListAPIView(APIView):
    def get(self, request, thread_id):
        try:
            thread = ChatThread.objects.get(id=thread_id, user=request.user)
        except ChatThread.DoesNotExist:
            return Response({'error': 'Thread not found.'}, status=status.HTTP_404_NOT_FOUND)

        messages = ChatMessage.objects.filter(thread=thread)
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

class ChatAPIView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)
 

    def post(self, request):
        user = request.user
        question = request.data.get('question')

        if not question:
            return Response({'error': 'Question is required.'}, status=status.HTTP_400_BAD_REQUEST)

        chat_thread, created = ChatThread.objects.get_or_create(user=user)

        gorq_response = self.get_chat_response(question)

        chat_message = ChatMessage(
            thread=chat_thread,
            user=user,
            message=question,
            response=gorq_response
        )
        chat_message.save()

        serializer = ChatMessageSerializer(chat_message)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_chat_response(self, question):
        system_message = {
            "role": "system",
            "content": "You are an intelligent assistant. Please provide informative and helpful responses."
        }

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    system_message,
                    {
                        "role": "user",
                        "content": question,
                    }
                ],
                model="llama3-8b-8192",  
            )
            return chat_completion['choices'][0]['message']['content']
        except Exception as e:
            return str(e)


