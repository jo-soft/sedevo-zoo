from django.http import JsonResponse
from rest_framework.parsers import JSONParser

from backend.backend.animals.models import Animal
from backend.backend.animals.serializers import AnimalSerializer


def animals_list(request):
    """
    List all animals, or create a new animal.
    """
    if request.method == 'GET':
        animals = Animal.objects.all()
        serializer = AnimalSerializer(animals, many=True)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = AnimalSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

def animal(request, pk):
    """
    Retrieve, update or delete an animal.
    """
    try:
        animal = Animal.objects.get(pk=pk)
    except Animal.DoesNotExist:
        return JsonResponse({'error': 'Animal not found'}, status=404)

    if request.method == 'GET':
        serializer = AnimalSerializer(animal)
        return JsonResponse(serializer.data)
    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = AnimalSerializer(animal, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)
    elif request.method == 'DELETE':
        animal.delete()
        return JsonResponse({'message': 'Animal deleted successfully'}, status=204)