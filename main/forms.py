from django.forms import ModelForm
from main.models import Product

class ProductForm(ModelForm):
    class Meta:
        model = Product
        fields = ["name", "price", "description", "category", "thumbnail","is_featured"]

# class CarForm(ModelForm):
#     class Meta:
#         model = Car
#         fields = ["name", "Brand", "Stock"]