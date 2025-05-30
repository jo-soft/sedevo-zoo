from token import AWAIT

import pytest
from channels.layers import get_channel_layer
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.test import TestCase
from django.urls import path

from animals.consumers import AnimalWebsocketView, WS_ANIMAL_GROUP


class TestAnimalWebsocketView(TestCase):

    path = "ws/animals/"

    def setUp(self):
        self.application = URLRouter([
            path(self.path, AnimalWebsocketView.as_asgi()),
        ])

    @pytest.mark.asyncio
    async def test_animal_created(self):
        communicator = WebsocketCommunicator(self.application, self.path)
        connected, proto = await communicator.connect()
        self.assertTrue(connected)

        channel_layer = get_channel_layer()

        message = {
            'type': 'animal.created',
            'data': {
                'id': 1,
                'name': 'Lion',
                'weight': 190,
                'extinct_since': None
            }
        }

        await channel_layer.group_send(WS_ANIMAL_GROUP, message)

        response = await communicator.receive_json_from()
        self.assertEqual(response, message)

        await communicator.disconnect()

    @pytest.mark.asyncio
    async def test_animal_updated(self):
        communicator = WebsocketCommunicator(self.application, self.path)
        connected, proto = await communicator.connect()
        self.assertTrue(connected)

        channel_layer = get_channel_layer()

        message = {
            'type': 'animal.updated',
            'data': {
                'id': 1,
                'name': 'Lion',
                'weight': 200,
                'extinct_since': None
            }
        }

        await channel_layer.group_send(WS_ANIMAL_GROUP, message)

        response = await communicator.receive_json_from()
        self.assertEqual(response, message)

        await communicator.disconnect()

    @pytest.mark.asyncio
    async def test_animal_deleted(self):
        communicator = WebsocketCommunicator(self.application, self.path)
        connected, proto = await communicator.connect()
        self.assertTrue(connected)

        channel_layer = get_channel_layer()

        message = {
            'type': 'animal.deleted',
            'data': 1
        }

        await channel_layer.group_send(WS_ANIMAL_GROUP, message)

        response = await communicator.receive_json_from()
        self.assertEqual(response, message)

        await communicator.disconnect()
