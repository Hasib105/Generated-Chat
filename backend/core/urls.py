from django.urls import path
from .views import ExampleView,UserRegisterView, UserLoginView, UserLogoutView

urlpatterns = [
    path('example/', ExampleView.as_view()),
    path('register/', UserRegisterView.as_view(), name='register'), 
    path('login/', UserLoginView.as_view(), name='login'),          
    path('logout/', UserLogoutView.as_view(), name='logout'),       
]