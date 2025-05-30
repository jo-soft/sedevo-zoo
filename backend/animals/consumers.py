from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncJsonWebsocketConsumer

WS_ANIMAL_GROUP = "animals"


class AnimalWebsocketView(AsyncJsonWebsocketConsumer):

    groups = [WS_ANIMAL_GROUP]

    async def animal_created(self, event):
        await self.send_json({
            'type': 'animal.created',
            'data': event['data']
        })

    async def animal_updated(self, event):
        await self.send_json({
            'type': 'animal.updated',
            'data': event['data']
        })

    async def animal_deleted(self, event):
        await self.send_json({
            'type': 'animal.deleted',
            'data': event['data']
        })
