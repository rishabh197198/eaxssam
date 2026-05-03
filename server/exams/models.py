from django.db import models
import string
import random

# Helper function to generate the 6-character class code
def generate_class_code():
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        # Ensure the code is strictly unique
        if not Classroom.objects.filter(code=code).exists():
            return code

class Classroom(models.Model): # <--- FIXED THIS LINE!
    # We use CharField for teacher_id to seamlessly store Clerk user IDs
    teacher_id = models.CharField(max_length=255, db_index=True)
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, blank=True, null=True)
    code = models.CharField(max_length=6, unique=True, default=generate_class_code)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Enrollment(models.Model):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name="enrollments")
    student_id = models.CharField(max_length=255, db_index=True) # Clerk user ID
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # A student can only join a specific class once
        unique_together = ('classroom', 'student_id')

class Test(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    
    teacher_id = models.CharField(max_length=255, db_index=True)
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name="tests")
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Medium')
    duration_minutes = models.IntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"Question {self.order} for {self.test.title}"

class AnswerOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class Submission(models.Model):
    STATUS_CHOICES = [
        ('Passed', 'Passed'),
        ('Failed', 'Failed'),
        ('Flagged', 'Flagged'),
    ]

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="submissions")
    student_id = models.CharField(max_length=255, db_index=True)
    score = models.FloatField(default=0.0)
    warnings_count = models.IntegerField(default=0) # Tracks tab-switches from React
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Failed')
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student_id} - {self.test.title} - {self.score}%"