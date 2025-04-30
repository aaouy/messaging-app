import json, uuid
from .models import ChatRooms, Messages, Profile
from .utils import serialize_user, serialize_chatroom
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.db import IntegrityError
from django.db.models import Max, F
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

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
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': "Invalid JSON body."})
    user = authenticate(request, username=data["username"], password=data["password"])
    if user:
        login(request, user)
        return JsonResponse({'user': {'id': user.id, 'username': user.username, 'profile_picture': HOST_PREFIX + user.profile_picture.url}}, status=200)
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
        users = Profile.objects.filter(username__in=data['users'])    
        chatroom = ChatRooms.objects.create()
        chatroom.users.add(*users)
    except Profile.DoesNotExist:
        return JsonResponse({'error': 'Profile does not exist'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
    except IntegrityError:
        return JsonResponse({'error': 'Database error! Possibly duplicate or invalid data.'}, status=400)
    except Exception:
        return JsonResponse({"error": "An unexpected error has occurred."}, status=500)
    
    user_list = []
    for user in users:
        user_list.append(serialize_user(user))
    return JsonResponse({'id': chatroom.chatroom_id, 'users': user_list, 'num_unread_mssgs': 0})

@login_required
@require_POST
def save_message(request):
    try:
        data = json.loads(request.body)
        chatroom = ChatRooms.objects.get(chatroom_id=data['chat_room_id'])
        message = Messages.objects.create(sender=request.user, chatroom=chatroom, content=data['content'])
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
    except Exception:
        return JsonResponse({'error': 'An unexpected error has occurred.'}, status=500)
    return JsonResponse({'sender': serialize_user(request.user),'content': data['content'], 'chat_room': serialize_chatroom(chatroom), 'sent_at': message.sent_at})
    
@login_required
@require_GET
def get_chatroom(request, page):
    try:
        chatrooms = ChatRooms.objects.filter(users=request.user).annotate(latest_mssg_time=Max('messages__sent_at')).order_by(F('latest_mssg_time').desc(nulls_last=True), '-created_at')
        if not chatrooms:
            return JsonResponse({'chat_rooms': [], 'has_next': False, 'total_pages': 0, 'current_page': 0}, status=200)

        chatroom_list = []
        for chatroom in chatrooms:
            chatroom_list.append(serialize_chatroom(chatroom))
    
        paginator = Paginator(chatroom_list, 20)
        try:
            chatrooms_page = paginator.page(page)
        except PageNotAnInteger:
            chatrooms_page = paginator.page(1)
        except EmptyPage:
            chatrooms_page = []
            
        response = {
            'chat_rooms': list(chatrooms_page),
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
    
    # Latest messages at the front.
    messages = chatroom.messages.all().order_by('-sent_at') 
    paginator = Paginator(messages, 50)
    try:
        messages_page = paginator.page(page)
    except PageNotAnInteger:
        messages_page = paginator.page(1)
    except EmptyPage:
        messages_page = [] 

    # Latest messages at the front.
    chatroom_messages = []
    for message in messages_page:
        message_obj = {'chatroom': serialize_chatroom(chatroom), 'content': message.content, 'sender': serialize_user(message.sender), 'sent_at': message.sent_at}
        chatroom_messages.append(message_obj)
        
    response = {
        'messages': chatroom_messages,
        'has_next': messages_page.has_next() if messages_page else False,
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


    
        

