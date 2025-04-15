import json, uuid
from .models import ChatRooms, Messages, Profile
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.db import IntegrityError
from django.db.models import Max, F
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.exceptions import ObjectDoesNotExist

HOST_PREFIX = 'http://localhost:8000'

@ensure_csrf_cookie
def get_csrf_token(request):
    return HttpResponse('CSRF cookie set')

@require_POST
def create_user(request):
    data = json.loads(request.body)
    try:
        Profile.objects.create_user(username=data['username'], password=data['password'])
    except IntegrityError:
        return JsonResponse({'error': 'Username already exists'}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({'message': 'User created successfully'}, status=201)

@require_POST
def login_user(request):
    data = json.loads(request.body)
    user = authenticate(request, username=data["username"], password=data["password"])
    if user:
        login(request, user)
        return JsonResponse({'username': user.username, 'profile_pic': HOST_PREFIX + user.profile_picture.url})
    return JsonResponse({"error": "Invalid credentials"}, status=400)

@login_required
@require_POST
def logout_user(request):
    logout(request)
    return HttpResponse("user logged out!")

@login_required
@require_POST 
def create_chatroom(request):
    try:
        data = json.loads(request.body)
        chatroom = ChatRooms.objects.create(name=data.get('name'))
        recipient = Profile.objects.get(username=data.get('name'))
        chatroom.users.add(request.user, recipient)
        return JsonResponse({"chatroom_id": chatroom.chatroom_id, "user": {'id': recipient.id, 'username': recipient.username}, "profile_pic": HOST_PREFIX + recipient.profile_picture.url}, status=201)
    except Profile.DoesNotExist:
        return JsonResponse({'error': 'Profile does not exist'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
    except IntegrityError:
        return JsonResponse({'error': 'Database error! Possibly duplicate or invalid data.'}, status=400)
    except Exception:
        return JsonResponse({"error": "An unexpected error has occurred."}, status=500)

@login_required
@require_POST
def save_message(request):
    try:
        data = json.loads(request.body)
        chatroom = ChatRooms.objects.get(chatroom_id=data['chatroom_id'])
        Messages.objects.create(sender=request.user, chatroom=chatroom, content=data['message'])
        return HttpResponse('message saved', status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
    except Exception:
        return JsonResponse({'error': 'An unexpected error has occurred.'}, status=500)
    
@login_required
@require_GET
def get_chatroom(request, page):
    try:
        chatrooms = ChatRooms.objects.filter(users=request.user).annotate(latest_mssg_time=Max('messages__sent_at')).order_by(F('latest_mssg_time').desc(nulls_last=True), '-created_at')
        if not chatrooms:
            return JsonResponse({'chatrooms': [], 'message': 'No rooms'}, status=200)
        
        chatroom_list = []
        for chatroom in chatrooms:
            recipient = chatroom.users.exclude(id=request.user.id).first()
            chatroom_obj = {'chatroom_id': chatroom.chatroom_id, 'user': {'id': recipient.id, 'username': recipient.username},'profile_pic': HOST_PREFIX + recipient.profile_picture.url, 'unread_messages': chatroom.num_unread_mssgs}
            chatroom_list.append(chatroom_obj)
            
        paginator = Paginator(chatroom_list, 20)
        try:
            chatrooms_page = paginator.page(page)
        except PageNotAnInteger:
            chatrooms_page = paginator.page(1)
        except EmptyPage:
            chatrooms_page = []
            
        response = {
            'chatrooms': list(chatrooms_page),
            'has_next': chatrooms_page.has_next() if chatrooms_page else False,
            'total_pages': paginator.num_pages,
            'current_page': int(page),
        }
        return JsonResponse(response, status=201)   
    except Exception:
        return JsonResponse({"error": "chatrooms were not able to be retrieved"}, status=400)

@login_required
@require_GET
def get_chatroom_messages(request, chatroom_id, page):
    try:
        chatroom = ChatRooms.objects.get(chatroom_id=chatroom_id)
    except Exception:
        return HttpResponseNotFound('chatroom not found')
    
    messages = chatroom.messages_set.all().order_by('-sent_at') # newest messages at the front
    paginator = Paginator(messages, 50)
    try:
        messages_page = paginator.page(page)
    except PageNotAnInteger:
        messages_page = paginator.page(1)
    except EmptyPage:
        messages_page = [] 

    chatroom_messages = []
    for message in messages_page:
        message_obj = {'chatroom': chatroom_id, 'content': message.content, 'sender': message.sender.username, 'profile_pic': HOST_PREFIX + message.sender.profile_picture.url, 'sent_at': message.sent_at}
        chatroom_messages.append(message_obj)
        
    response = {
        'messages': chatroom_messages,
        'has_next': messages_page.has_next(),
        'total_pages': paginator.num_pages,
        'current_page': int(page)
    }
    
    return JsonResponse(response, status=201)

@login_required
@require_POST
def upload_profile_pic(request):
    image_file = request.FILES.get('cropped_image')
    if image_file:
        ext = image_file.name.split('.')[-1]
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        request.user.profile_picture.save(unique_filename, image_file)
        return JsonResponse({'profile_pic': HOST_PREFIX + request.user.profile_picture.url}, status=200)
    return HttpResponse('image not saved')


    
        

