import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


# Create your models here.
class Product(models.Model):
    CATEGORY_CHOICES = [("Food", "Food"),
    ("Drink", "Drink"),
    ("Snack", "Snack"),
    ("Accessory", "Accessory"),
    ("Clothing", "Clothing"),
    ("Other", "Other"),]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    price = models.IntegerField()
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='Other')
    thumbnail = models.URLField()
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_viewed = models.DateTimeField(null=True, blank=True)
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True) # menambahkan relasi ke model User

    def __str__(self):
        return self.name
    
    
# class Employee(models.Model):
#     name = models.CharField(max_length=255)
#     age = models.IntegerField()
#     persona = models.TextField()

#     def __str__(self):
#         return self.name

