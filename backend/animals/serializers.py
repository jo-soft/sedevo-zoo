from rest_framework import serializers

from backend.backend.animals.models import Animal


class AnimalSerializer(serializers.Serializer):
    class Meta:
        model = Animal
        fields = ('id', 'name', 'weight', 'extinct_since', 'hologram')
        read_only_fields = ('id')