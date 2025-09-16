from django.core import serializers
from django.http import HttpResponse
from .models import Product
from django.shortcuts import render, redirect, get_object_or_404
from main.forms import ProductForm

# from models import Employee
# from django.http import HttpResponse


# Create your views here.
def show_main(request):
    Product_list = Product.objects.all()

    context = {
        'npm' : '2406403482',
        'name': 'Andrew Sanjay Hasian Panjaitan',
        'class': 'PBP D',
        'Product_list': Product_list
    }

    return render(request, "main.html", context)

def create_product(request):
    form = ProductForm(request.POST or None)

    if form.is_valid():
        form.save()
        return redirect('main:show_main')
    
    context = {'form': form}
    return render(request, 'create_product.html', context)  

def show_product(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    context = {'product': product}
    return render(request, 'product_detail.html', context)



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