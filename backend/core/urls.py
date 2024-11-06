from django.urls import path
from .views import ExampleView,UserRegisterView, UserLoginView, UserListView,ThreadListCreateAPIView, MessageListAPIView, ChatAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('example/', ExampleView.as_view()),
    path('users/', UserListView.as_view()),
    path('register/', UserRegisterView.as_view(), name='register'), 
    path('login/', UserLoginView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),   
    path('threads/', ThreadListCreateAPIView.as_view(), name='thread_list_create'),
    path('threads/<str:thread_id>/messages/', MessageListAPIView.as_view(), name='message_list'),
    path('threads/<str:thread_id>/chat/', ChatAPIView.as_view(), name='chat'),

]


