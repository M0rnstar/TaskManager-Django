from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, CreateTaskView, ListTasksView, DeleteTaskView, UpdateTaskView, UserProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/tasks/create", CreateTaskView.as_view(), name="create_task"),
    path("api/tasks/", ListTasksView.as_view(), name="list_tasks"),
    path("api/tasks/<int:pk>/delete", DeleteTaskView.as_view(), name="delete_task"),
    path("api/tasks/<int:pk>/update", UpdateTaskView.as_view(), name="update_task"),
    path("api/user/profile", UserProfileView.as_view(), name="user_profile"),
]
