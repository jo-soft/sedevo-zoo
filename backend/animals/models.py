from django.db import models

class Animal(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    weight = models.FloatField()
    extinct_since = models.IntegerField() # extinct_since in years (approx)
    hologram = models.FileField(upload_to='hologram/', null=True)
    super_power = models.CharField(max_length=100)
