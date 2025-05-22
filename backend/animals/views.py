from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework import  viewsets

from .models import Animal
from .serializers import AnimalSerializer

class AnimalView(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer


    @action(
        detail=True,
        methods=["POST"],
        parser_classes=[FileUploadParser],
    )
    def upload(self, request, **_kwargs):
        animal = self.get_object()

        file_obj = request.data["file"]

        if not file_obj:
            raise ValidationError("No file provided.")


        animal_data = AnimalSerializer(animal).data
        animal_data['hologram'] = file_obj
        serializer = AnimalSerializer(instance=animal, data=animal_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)
