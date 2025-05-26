from rest_framework import serializers

from .models import Animal


class AnimalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Animal
        fields = ('id', 'name', 'weight',
                  'extinct_since', 'model', 'super_power')
        read_only_fields = ('id',)
