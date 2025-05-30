from django.db import IntegrityError
from django.test import TestCase
from unittest.mock import patch, AsyncMock

from animals.consumers import WS_ANIMAL_GROUP
from animals.models import Animal
from animals.serializers import AnimalSerializer


class TestAnimalModel(TestCase):

    def test_create_animal(self):
        animal = Animal.objects.create(
            name="Test Animal",
            weight=100,
            extinct_since=5000,
            super_power="Test Power"
        )
        self.assertEqual(animal.name, "Test Animal")
        self.assertEqual(animal.weight, 100)
        self.assertEqual(animal.extinct_since, 5000)
        self.assertEqual(animal.super_power, "Test Power")

    def test_weight_cannot_be_negative(self):
        with self.assertRaises(IntegrityError):
            Animal.objects.create(
                name="Invalid Animal",
                weight=-10,
                extinct_since=5000,
                super_power="Invalid Power"
            )

    def test_super_power_optional(self):
        animal = Animal.objects.create(
            name="No Power Animal",
            weight=200,
            extinct_since=3000
        )
        self.assertEqual(animal.super_power, "")

    def test_extinct_since_cannot_be_negative(self):
        with self.assertRaises(IntegrityError):
            Animal.objects.create(
                name="Invalid Extinct Animal",
                weight=100,
                extinct_since=-100,
                super_power="Invalid Power"
            )

    def test_create_triggers_channel_layer(self):
        with patch("animals.models.get_channel_layer") as mock_get_channel_layer:
            mock_channel_layer = mock_get_channel_layer.return_value
            with patch("animals.models.get_channel_layer.group_send", new_callable=AsyncMock) as mock_group_send:
                mock_channel_layer.group_send = mock_group_send

                animal = Animal(
                    name="Create Animal",
                    weight=123,
                    extinct_since=1000,
                    super_power="Speed"
                )

                animal.save()

                serialized = AnimalSerializer(animal).data

                self.assertTrue(mock_group_send.called)
                args, kwargs = mock_group_send.call_args
                self.assertEqual(args[0], WS_ANIMAL_GROUP)
                self.assertEqual(args[1], {
                    'type': 'animal.created',
                    'data': serialized
                })

    def test_update_triggers_channel_layer(self):
        animal = Animal.objects.create(
            name="Update Animal",
            weight=200,
            extinct_since=1500,
            super_power="Strength"
        )

        with patch("animals.models.get_channel_layer") as mock_get_channel_layer:
            mock_channel_layer = mock_get_channel_layer.return_value
            with patch("animals.models.get_channel_layer.group_send", new_callable=AsyncMock) as mock_group_send:
                mock_channel_layer.group_send = mock_group_send

                animal.name = "Updated Animal"
                animal.save()

                self.assertTrue(mock_group_send.called)
                args, kwargs = mock_group_send.call_args
                self.assertEqual(args[0], WS_ANIMAL_GROUP)
                self.assertEqual(args[1], {
                    'type': 'animal.updated',
                    'data': {
                        'id': animal.id,
                        'name': "Updated Animal",
                        'weight': 200,
                        'extinct_since': 1500,
                        'super_power': "Strength",
                        'model': None
                    }
                })

    def test_delete_triggers_channel_layer(self):
        animal = Animal.objects.create(
            name="Delete Animal",
            weight=321,
            extinct_since=2000,
            super_power="Fly"
        )

        with patch("animals.models.get_channel_layer") as mock_get_channel_layer:
            mock_channel_layer = mock_get_channel_layer.return_value
            with patch("animals.models.get_channel_layer.group_send", new_callable=AsyncMock) as mock_group_send:
                mock_channel_layer.group_send = mock_group_send

                # store the animal ID before deletion
                animal_id = animal.id

                animal.delete()

                self.assertTrue(mock_group_send.called)
                args, kwargs = mock_group_send.call_args
                self.assertEqual(args[0], WS_ANIMAL_GROUP)
                self.assertEqual(args[1], {
                    'type': 'animal.deleted',
                    'data': animal_id
                })
