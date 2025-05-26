from django.db import models
from django.core.validators import MinValueValidator


class Animal(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField()
    weight = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    extinct_since = models.PositiveIntegerField(
        validators=[MinValueValidator(0)])
    model = models.FileField(upload_to='model/', null=True)
    super_power = models.CharField(max_length=100, blank=True, default="")
