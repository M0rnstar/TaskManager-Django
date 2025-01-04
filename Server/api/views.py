from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.generics import CreateAPIView
from .serializers import UserSerialzer, TaskSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Task


# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerialzer
    permission_classes = [AllowAny]

class CreateTaskView(CreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)