from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Task

class UserSerialzer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email"]
        extra_kwargs = {"password": {"write_only": True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class TaskSerializer(serializers.ModelSerializer):
    deadline = serializers.DateTimeField(format="%d.%m.%Y") # type: ignore

    class Meta:
        model = Task
        fields = ["id", "title", "content", "created_at", "user", "deadline"]
        extra_kwargs = {"user": {"read_only": True}}