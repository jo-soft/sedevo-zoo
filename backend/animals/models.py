from django.db import models

class AnimalHologram(models.Model):
    id = models.AutoField(primary_key=True)
    hologram_path= models.CharField(max_length=255)
    hologram_size = models.CharField(max_length=50)
    hologram_color = models.CharField(max_length=50)

class Animal(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    weight = models.FloatField()
    # extinct_since in years (approx)
    extinct_since = models.IntegerField()
    hologram = models.OneToOneField(AnimalHologram, on_delete=models.CASCADE)
