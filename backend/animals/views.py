from django.core.exceptions import FieldError
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import  viewsets

from .models import Animal
from .serializers import AnimalSerializer

class AnimalView(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer

    def get_queryset(self):
        params = self.request.query_params
        qs = super().get_queryset()

        orders = filter(lambda x: x, params.getlist("order[]", []))

        qs = qs.filter(
            Q(name__icontains=params.get("name", "")),
            Q(weight__gte=params.get("weight_gte", 0)),
            Q(extinct_since__gte=params.get("extinct_since_gte", 0)),
        )

        if (orders):
            try:
                return qs.order_by(*orders)
            except FieldError:
                pass
        return qs



    @action(
        detail=True,
        methods=["POST"],
        parser_classes=[MultiPartParser],
    )
    def upload(self, request, **_kwargs):
        animal = self.get_object()

        file_obj = request.data["file"]

        if not file_obj:

            raise ValidationError("No file provided.")

        animal_data = AnimalSerializer(animal).data
        animal_data['model'] = file_obj
        serializer = AnimalSerializer(instance=animal, data=animal_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)
