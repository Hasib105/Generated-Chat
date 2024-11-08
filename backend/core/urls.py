from django.urls import path
from .views import ExampleView,UserRegisterView, UserLoginView, UserListView,ThreadListCreateAPIView, MessageListAPIView, ChatAPIView ,SettingsUpdateView,ModelChoicesView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('example/', ExampleView.as_view()),
    path('users/', UserListView.as_view()),
    path('register/', UserRegisterView.as_view(), name='register'), 
    path('login/', UserLoginView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),   
    path('threads/', ThreadListCreateAPIView.as_view(), name='thread-list-create'),
    path('threads/<slug:slug>/messages/', MessageListAPIView.as_view(), name='message-list'),
    path('threads/chat/', ChatAPIView.as_view(), name='chat'),
    path('settings/update/', SettingsUpdateView.as_view(), name='settings-update'),
    path('settings/model-choices/', ModelChoicesView.as_view(), name='model-choices'),

]


