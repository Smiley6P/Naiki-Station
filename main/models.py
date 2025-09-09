from django.db import models

# Create your models here.
class Product(models.Model):
    category = []

    name = models.CharField(max_length=100)
    price = models.IntegerField()
    description = models.TextField()
    thumbnail = models.URLField()
    category = models.CharField(max_length=50)
    isFeatured = models.BooleanField(default=False)

    def __str__(self):
        return self.name