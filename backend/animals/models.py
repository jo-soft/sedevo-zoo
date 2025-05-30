from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import models
from django.core.validators import MinValueValidator
from .consumers import WS_ANIMAL_GROUP


class Animal(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField()
    weight = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    extinct_since = models.PositiveIntegerField(
        validators=[MinValueValidator(0)])
    model = models.FileField(upload_to='model/', null=True)
    super_power = models.CharField(max_length=100, blank=True, default="")

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        # local import to avoid circular import issues
        from .serializers import AnimalSerializer
        serialized = AnimalSerializer(self).data

        # send info to channel
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            WS_ANIMAL_GROUP,
            {
                'type': 'animal.created' if is_new else 'animal.updated',
                'data': serialized
            }
        )

    def delete(self, *args, **kwargs):
        animal_id = self.id

        super().delete(*args, **kwargs)

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            WS_ANIMAL_GROUP,
            {
                'type': 'animal.deleted',
                'data': animal_id
            }
        )
