import json
import os
from google import genai
from google.genai import types
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg
from .models import Classroom, Enrollment, Test, Question, AnswerOption, Submission

# --- GEMINI CONFIGURATION (NEW SDK) ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_ACTUAL_API_KEY_HERE")
client = genai.Client(api_key=GEMINI_API_KEY)

@csrf_exempt
def generate_questions(request):
    """Calls Gemini API to generate a multiple-choice test and returns strict JSON."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            topic = data.get('topic', 'General Knowledge')
            difficulty = data.get('difficulty', 'Medium')
            num_questions = data.get('num_questions', 5)
            
            prompt = f"""
            You are an expert educator. Create a {difficulty} level multiple-choice test about "{topic}".
            Generate exactly {num_questions} questions.
            
            You MUST return the response matching this exact structure:
            {{
                "questions": [
                    {{
                        "question": "Question text here?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct_answer": "Option A"
                    }}
                ]
            }}
            """
            
            # THE FIX: Updated the model to gemini-2.5-flash
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                )
            )
            
            # Because we used application/json, we don't need to strip markdown backticks!
            generated_data = json.loads(response.text.strip())
            return JsonResponse(generated_data, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "AI returned malformed data. Please try generating again."}, status=500)
        except Exception as e:
            return JsonResponse({"error": f"AI Generation Failed: {str(e)}"}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def teacher_classrooms(request):
    """Handles fetching and creating Classrooms"""
    if request.method == 'GET':
        teacher_id = request.GET.get('teacher_id')
        if not teacher_id:
            return JsonResponse({'error': 'Teacher ID is required'}, status=400)
            
        classrooms = list(Classroom.objects.filter(teacher_id=teacher_id).values('id', 'name', 'subject', 'code'))
        
        for c in classrooms:
            c['students'] = Enrollment.objects.filter(classroom_id=c['id']).count()
            
        return JsonResponse({'classrooms': classrooms}, status=200)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_class = Classroom.objects.create(
                teacher_id=data['teacher_id'],
                name=data['name'],
                subject=data.get('subject', 'General')
            )
            return JsonResponse({'message': 'Created', 'code': new_class.code}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def publish_test(request):
    """Saves the AI-generated test to the Django Database"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            classroom = Classroom.objects.get(id=data['classroom_id'])

            test = Test.objects.create(
                teacher_id=data['teacher_id'],
                classroom=classroom,
                title=data['title'],
                topic=data['topic'],
                difficulty=data['difficulty'],
                duration_minutes=data.get('duration_minutes', 60)
            )

            for i, q_data in enumerate(data['questions']):
                question = Question.objects.create(test=test, text=q_data['question'], order=i+1)
                
                correct_idx = q_data.get('correct', 0)
                
                for j, opt_text in enumerate(q_data['options']):
                    AnswerOption.objects.create(
                        question=question, 
                        text=opt_text, 
                        is_correct=(j == correct_idx)
                    )

            return JsonResponse({'message': 'Test published successfully!', 'test_id': test.id}, status=201)
        except Classroom.DoesNotExist:
            return JsonResponse({'error': 'Selected classroom does not exist.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def student_tests(request):
    """Fetches tests for a student based on their enrolled classrooms"""
    if request.method == 'GET':
        student_id = request.GET.get('student_id') 
        if not student_id:
             return JsonResponse({'error': 'Student ID required'}, status=400)
        
        enrollments = Enrollment.objects.filter(student_id=student_id).values_list('classroom_id', flat=True)
        
        tests = Test.objects.filter(classroom_id__in=enrollments).values(
            'id', 'title', 'topic', 'duration_minutes', 'classroom__name'
        )
        
        formatted_tests = []
        for t in tests:
            question_count = Question.objects.filter(test_id=t['id']).count()
            submission = Submission.objects.filter(test_id=t['id'], student_id=student_id).first()
            
            status = 'completed' if submission else 'available'
            score = f"{submission.score}%" if submission else None

            formatted_tests.append({
                'id': t['id'],
                'title': t['title'],
                'category': t['classroom__name'],
                'duration': f"{t['duration_minutes']} mins",
                'questions': question_count,
                'deadline': 'No Deadline',
                'status': status,
                'score': score
            })
            
        return JsonResponse({'tests': formatted_tests}, status=200)


@csrf_exempt
def analytics(request):
    """Fetches real dashboard data for the Teacher Analytics page"""
    if request.method == 'GET':
        teacher_id = request.GET.get('teacher_id')
        if not teacher_id:
            return JsonResponse({'error': 'Teacher ID required'}, status=400)
            
        total_tests = Test.objects.filter(teacher_id=teacher_id).count()
        total_submissions = Submission.objects.filter(test__teacher_id=teacher_id).count()
        
        avg_score_data = Submission.objects.filter(test__teacher_id=teacher_id).aggregate(Avg('score'))
        avg_score = avg_score_data['score__avg'] or 0
        
        flagged_sessions = Submission.objects.filter(test__teacher_id=teacher_id, warnings_count__gt=0).count()

        stats = [
            {"title": "Total Tests Created", "value": str(total_tests), "isPositive": True, "change": ""},
            {"title": "Total Submissions", "value": str(total_submissions), "isPositive": True, "change": ""},
            {"title": "Average Score", "value": f"{round(avg_score, 1)}%", "isPositive": avg_score > 70, "change": ""},
            {"title": "Flagged Sessions", "value": str(flagged_sessions), "isPositive": False, "change": "Review Needed" if flagged_sessions > 0 else "All Clear"},
        ]

        recent = Submission.objects.filter(test__teacher_id=teacher_id).order_by('-submitted_at')[:10]
        recent_results = []
        for sub in recent:
            recent_results.append({
                "id": sub.id,
                "student": f"Student {sub.student_id[-4:]}", 
                "test": sub.test.title,
                "score": round(sub.score, 1),
                "status": sub.status,
                "date": sub.submitted_at.strftime("%b %d, %Y")
            })

        return JsonResponse({
            'stats': stats,
            'chartData': [], 
            'recentResults': recent_results
        }, status=200)
    
@csrf_exempt
def join_classroom(request):
    """Allows a student to join a classroom using the unique 6-character code."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            student_id = data.get('student_id')
            class_code = data.get('code', '').upper()

            classroom = Classroom.objects.get(code=class_code)
            
            # Create enrollment if it doesn't exist
            enrollment, created = Enrollment.objects.get_or_create(
                classroom=classroom,
                student_id=student_id
            )

            if not created:
                return JsonResponse({'error': 'You are already in this class'}, status=400)

            return JsonResponse({'message': f'Successfully joined {classroom.name}'}, status=201)

        except Classroom.DoesNotExist:
            return JsonResponse({'error': 'Invalid Class Code'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
@csrf_exempt
def student_classrooms(request):
    """Fetches all classrooms a specific student has joined."""
    if request.method == 'GET':
        student_id = request.GET.get('student_id')
        if not student_id:
            return JsonResponse({'error': 'Student ID required'}, status=400)
            
        # Get classroom IDs from Enrollments
        classroom_ids = Enrollment.objects.filter(student_id=student_id).values_list('classroom_id', flat=True)
        
        # Fetch Classroom details
        classrooms = Classroom.objects.filter(id__in=classroom_ids)
        
        results = []
        for c in classrooms:
            results.append({
                'id': c.id,
                'name': c.name,
                'subject': c.subject,
                'teacher_name': "Teacher" # You can extend this to fetch the teacher's profile/name
            })
            
        return JsonResponse({'classrooms': results}, status=200)


@csrf_exempt
def get_test_details(request, test_id):
    """Fetches questions and options for a specific test for the ExamSession."""
    if request.method == 'GET':
        try:
            test = Test.objects.get(id=test_id)
            questions = test.questions.all().order_by('order')
            
            questions_list = []
            for q in questions:
                options = q.options.all()
                questions_list.append({
                    "id": q.id,
                    "text": q.text,
                    "options": [opt.text for opt in options]
                })
            
            return JsonResponse({
                "id": test.id,
                "title": test.title,
                "durationSeconds": test.duration_minutes * 60,
                "questions": questions_list
            }, status=200)
        except Test.DoesNotExist:
            return JsonResponse({"error": "Test not found"}, status=404)
        
@csrf_exempt
def submit_test(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')
            student_id = data.get('student_id')
            user_answers = data.get('answers') # Format: {"question_id": selected_index}
            warnings = data.get('warnings', 0)

            test = Test.objects.get(id=test_id)
            questions = test.questions.all()
            
            total_questions = questions.count()
            correct_count = 0

            # Grade the test
            for q in questions:
                # Get the correct index from the database
                correct_option = q.options.filter(is_correct=True).first()
                # Find the index of that correct option in the list of all options for this q
                all_options = list(q.options.all())
                correct_index = all_options.index(correct_option) if correct_option in all_options else -1
                
                # Check if student's answer for this question ID matches
                student_answer = user_answers.get(str(q.id))
                if student_answer is not None and int(student_answer) == correct_index:
                    correct_count += 1

            score = (correct_count / total_questions) * 100 if total_questions > 0 else 0
            
            # Determine status
            status = 'Passed' if score >= 50 else 'Failed'
            if warnings > 3: status = 'Flagged'

            # Save the submission
            Submission.objects.create(
                test=test,
                student_id=student_id,
                score=score,
                warnings_count=warnings,
                status=status
            )

            return JsonResponse({'message': 'Results recorded', 'score': score}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
@csrf_exempt
def student_results(request):
    """Fetches a summary of all test results for a specific student."""
    if request.method == 'GET':
        student_id = request.GET.get('student_id')
        if not student_id:
            return JsonResponse({'error': 'Student ID required'}, status=400)

        submissions = Submission.objects.filter(student_id=student_id).order_by('-submitted_at')
        
        # Calculate Stats
        total_attempts = submissions.count()
        avg_score = submissions.aggregate(Avg('score'))['score__avg'] or 0
        passed_count = submissions.filter(status='Passed').count()

        stats = [
            {"label": "Average Score", "value": f"{round(avg_score, 1)}%"},
            {"label": "Tests Completed", "value": str(total_attempts)},
            {"label": "Exams Passed", "value": str(passed_count)},
        ]

        # History for Charting (Oldest to Newest for the line chart)
        history = []
        for sub in reversed(submissions):
            history.append({
                "testName": sub.test.title,
                "score": sub.score,
                "date": sub.submitted_at.strftime("%b %d"),
                "status": sub.status
            })

        return JsonResponse({
            'stats': stats,
            'history': history
        }, status=200)