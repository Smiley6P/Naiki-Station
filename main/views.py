from django.utils import timezone
from django.core import serializers
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import Product
from django.shortcuts import render, redirect, get_object_or_404
from main.forms import ProductForm
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
import datetime
from django.urls import reverse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
import json


# from models import Employee
# from django.http import HttpResponse

# Main Page
@login_required(login_url='/login')
def show_main(request):
    filter_type = request.GET.get("filter", "all")  # default 'all'

    if filter_type == "all":
        Product_list = Product.objects.all()
    elif filter_type == "my":
        Product_list = Product.objects.filter(user=request.user)
    elif filter_type == "featured":
            Product_list = Product.objects.filter(is_featured=True)

    context = {
        'npm' : '2406403482',
        'name': request.user.username,
        'class': 'PBP D',

        'loggedin_user': request.user.username,
        'product_list': Product_list,
        'last_login': request.COOKIES.get('last_login', 'Never')
    }

    return render(request, "main.html", context)


#Form dan Detail Product
@login_required(login_url='/login')
def create_product(request):
    form = ProductForm(request.POST or None)

    if form.is_valid()and request.method == 'POST':
        product_entry = form.save(commit = False)
        product_entry.user = request.user
        product_entry.save()

        return redirect('main:show_main')
    
    context = {'form': form}
    return render(request, 'create_product.html', context)  


@login_required(login_url='/login')
def show_product(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    context = {'product': product}
    product.last_viewed = timezone.now()
    product.save(update_fields=["last_viewed"])  
    return render(request, 'product_detail.html', context)

@login_required(login_url='/login')
def edit_product(request, id):
    product = get_object_or_404(Product, pk=id)
    if product.user != request.user:   # forbid non-owners
        return HttpResponse("You are not allowed to edit this product.", status=403)

    form = ProductForm(request.POST or None, instance=product)
    if form.is_valid() and request.method == 'POST':
        form.save()
        return redirect('main:show_main')

    context = {'form': form}
    return render(request, "edit_product.html", context)


@login_required(login_url='/login')
def delete_product(request, id):
    product = get_object_or_404(Product, pk=id)
    if product.user != request.user:
        return HttpResponse("You are not allowed to delete this product.", status=403)

    product.delete()
    return HttpResponseRedirect(reverse('main:show_main'))


#Login, logout,register
def register(request):
    form = UserCreationForm()

    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your account has been successfully created!')
            return redirect('main:login')
    context = {'form':form}
    return render(request, 'register.html', context)

def login_user(request):
   if request.method == 'POST':
      form = AuthenticationForm(data=request.POST)

      if form.is_valid():
        user = form.get_user()
        login(request, user)
        response = HttpResponseRedirect(reverse("main:show_main"))
        response.set_cookie('last_login', str(datetime.datetime.now()))
        return response

   else:
      form = AuthenticationForm(request)
   context = {'form': form}
   return render(request, 'login.html', context)

def logout_user(request):
    logout(request)
    response = HttpResponseRedirect(reverse('main:login'))
    response.delete_cookie('last_login')
    return response




# API XML dan JSON

def show_xml(request):
     Product_list = Product.objects.all()
     xml_data = serializers.serialize("xml", Product_list)
     return HttpResponse(xml_data, content_type="application/xml")

def show_json(request):
    product_list = Product.objects.all()
    data = [
        {
            'id': str(product.id),
            'name': product.name,
            'price': product.price,
            'description': product.description,
            'category': product.category,
            'thumbnail': product.thumbnail,
            'is_featured': product.is_featured,
            'created_at': product.created_at.isoformat(),
            'last_viewed': product.last_viewed.isoformat() if product.last_viewed else None,
            'user': product.user.username if product.user else 'Anonymous',
        }
        for product in product_list  
    ]

    return JsonResponse(data, safe=False)

def show_xml_by_id(request, product_id):
   try:
       product_item = Product.objects.filter(pk=product_id)
       xml_data = serializers.serialize("xml", product_item)
       return HttpResponse(xml_data, content_type="application/xml")
   except Product.DoesNotExist:
       return HttpResponse(status=404)

def show_json_by_id(request, product_id):
   try:
       product_item = Product.objects.get(pk=product_id)
       json_data = serializers.serialize("json", [product_item])
       return HttpResponse(json_data, content_type="application/json")
   except Product.DoesNotExist:
       return HttpResponse(status=404)

# def create_emplyee(request):
#     emp = Employee.objects.create(name="Kak Abhi", age = 19, persona="Sangat Baik")

#     return HttpResponse({emp.name})

# def create_car(request):
#     form = CarForm(request.POST or None)
#     if form.is_valid():
#         form.save()
#         return redirect('main:show_main')
#     context = {'form': form}
#     return render(request, 'car.html', context)


# TUGAS 6 - ajax and stuff
# serialize a product dict for JSON
def product_to_dict(p, request_user):
    return {
        "id": str(p.id),
        "name": p.name,
        "price": p.price,
        "description": p.description,
        "category": p.get_category_display() if hasattr(p, "get_category_display") else getattr(p, "category", ""),
        "thumbnail": p.thumbnail or "",
        "is_featured": bool(getattr(p, "is_featured", False)),
        "discount": getattr(p, "discount", None),
        "rating": getattr(p, "rating", None),
        "sold_count": getattr(p, "sold_count", None),
        "user": p.user.username if getattr(p, "user", None) else "",
        "is_owner": (request_user.is_authenticated and getattr(p, "user_id", None) == request_user.id),
        "detail_url": reverse("main:show_product", args=[str(p.id)]),
        "edit_url": reverse("main:edit_product", args=[str(p.id)]),
        "delete_url": reverse("main:delete_product", args=[str(p.id)]),
    }

#Add list/create endpoint:
@require_http_methods(["GET", "POST"])
def show_products_api(request):
    if request.method == "GET":
        flt = request.GET.get("filter", "all")
        qs = Product.objects.all().order_by("-updated_at") if hasattr(Product, "updated_at") else Product.objects.all()
        if flt == "my" and request.user.is_authenticated:
            qs = qs.filter(user=request.user)
        elif flt == "featured":
            if hasattr(Product, "is_featured"):
                qs = qs.filter(is_featured=True)
            else:
                qs = qs.none()
        data = [product_to_dict(p, request.user) for p in qs]
        return JsonResponse({"ok": True, "data": data}, status=200)

    if not request.user.is_authenticated:
        return JsonResponse({"ok": False, "error": "auth"}, status=401)

    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "bad_json"}, status=400)

    form = ProductForm(body)
    if form.is_valid():
        obj = form.save(commit=False)
        obj.user = request.user
        obj.save()
        return JsonResponse({"ok": True, "data": product_to_dict(obj, request.user)}, status=201)
    return JsonResponse({"ok": False, "errors": form.errors}, status=400)

# Add update/delete endpoint:
@require_http_methods(["PATCH", "DELETE"])
def product_detail_api(request, id):
    try:
        p = Product.objects.get(pk=id)
    except Product.DoesNotExist:
        return JsonResponse({"ok": False, "error": "not_found"}, status=404)

    if not request.user.is_authenticated:
        return JsonResponse({"ok": False, "error": "auth"}, status=401)
    if getattr(p, "user_id", None) != request.user.id:
        return JsonResponse({"ok": False, "error": "forbidden"}, status=403)

    if request.method == "DELETE":
        p.delete()
        return JsonResponse({"ok": True}, status=200)

    # PATCH
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "bad_json"}, status=400)

    # partial update
    for field in ["name", "price", "description", "category", "thumbnail", "is_featured"]:
        if field in body:
            setattr(p, field, body[field])
    p.save()
    return JsonResponse({"ok": True, "data": product_to_dict(p, request.user)}, status=200)

