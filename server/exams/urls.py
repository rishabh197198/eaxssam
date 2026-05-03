from django.urls import path
from . import views

urlpatterns = [
    path('generate-questions/', views.generate_questions),
    path('classrooms/', views.teacher_classrooms),
    path('publish-test/', views.publish_test),
    path('student-tests/', views.student_tests),
    path('analytics/', views.analytics),
    path('join-classroom/', views.join_classroom),
    path('classrooms/student/', views.student_classrooms),
    path('get-test/<int:test_id>/', views.get_test_details),
    path('submit-test/', views.submit_test),
    path('student-results/', views.student_results),
]