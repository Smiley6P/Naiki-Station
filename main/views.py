from django.utils import timezone
from django.core import serializers
from django.http import HttpResponse, HttpResponseRedirect
from .models import Product
from django.shortcuts import render, redirect, get_object_or_404
from main.forms import ProductForm
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
import datetime
from django.urls import reverse

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
    Product_list = Product.objects.all()
    json_data = serializers.serialize("json", Product_list)
    return HttpResponse(json_data, content_type="application/json")

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