import json
from http import HTTPStatus

from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError
from django.test import TestCase, RequestFactory
from rest_framework.test import APIClient

from animals.views import AnimalView
from animals.models import Animal


class TstAnimalView(TestCase):

    fixtures = ['animals.json']

    def setUp(self):
        self.factory = RequestFactory()

        ### Test for GET ###
    def test_get_list(self):
        all_animals = Animal.objects.all()
        request = self.factory.get('/animals/animal',)
        response = AnimalView.as_view({'get': 'list'})(request)

        self.assertEquals(response.status_code, 200)

        self.assertEquals(len(response.data), all_animals.count())
        for animal, expected_animal in zip(response.data, all_animals):
            self.assertEquals(animal['name'], expected_animal.name)
            self.assertEquals(animal['weight'], expected_animal.weight)
            self.assertEquals(animal['extinct_since'],
                              expected_animal.extinct_since)
            self.assertEquals(animal['super_power'],
                              expected_animal.super_power)
            if expected_animal.model:
                self.assertTrue(animal['model'].endswith(
                    expected_animal.model.url))

    def test_get_list_filter(self):
        search_term = 'eins'
        all_animals = Animal.objects.filter(name__contains=search_term)
        request = self.factory.get('/animals/animal', {'name': search_term})
        response = AnimalView.as_view({'get': 'list'})(request)

        self.assertEquals(response.status_code, 200)

        self.assertEquals(len(response.data), all_animals.count())

        for animal in response.data:
            self.assertIn(search_term, animal['name'])

    def test_get_by_id(self):
        animal = Animal.objects.first()
        request = self.factory.get(f'/animals/animal/{animal.id}/')
        response = AnimalView.as_view(
            {'get': 'retrieve'})(request, pk=animal.id)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data['name'], animal.name)
        self.assertEqual(response.data['weight'], animal.weight)
        self.assertEqual(response.data['extinct_since'], animal.extinct_since)
        self.assertEqual(response.data['super_power'], animal.super_power)

    def test_post_missing_data(self):
        data = json.dumps({
            "name": "Wishbone",
        })
        client = APIClient()
        response = client.post('/animals/animal/', data=data,
                               content_type='application/json')
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST._value_)

    def test_post(self):
        data = json.dumps({
            "name": "test animal",
            "weight": 232,
            "extinct_since": 100000,
            "super_power":  "it is tested"
        })
        client = APIClient()
        response = client.post('/animals/animal/', data=data,
                               content_type='application/json')
        self.assertEqual(response.status_code, HTTPStatus.CREATED)

        newest_animal = Animal.objects.latest('id')

        self.assertEqual(newest_animal.name, "test animal")
        self.assertEqual(newest_animal.weight, 232)
        self.assertEqual(newest_animal.extinct_since, 100000)
        self.assertEqual(newest_animal.super_power, "it is tested")

    def test_put(self):
        animal = Animal.objects.first()
        updated_data = json.dumps({
            "name": "updated animal",
            "weight": 300,
            "extinct_since": 50000,
            "super_power": "updated power"
        })
        client = APIClient()
        response = client.put(
            f'/animals/animal/{animal.id}/', data=updated_data, content_type='application/json')
        self.assertEqual(response.status_code, HTTPStatus.OK)

        animal.refresh_from_db()
        self.assertEqual(animal.name, "updated animal")
        self.assertEqual(animal.weight, 300)
        self.assertEqual(animal.extinct_since, 50000)
        self.assertEqual(animal.super_power, "updated power")

    def test_delete(self):
        animal = Animal.objects.first()
        client = APIClient()
        response = client.delete(f'/animals/animal/{animal.id}/')
        self.assertEqual(response.status_code, HTTPStatus.NO_CONTENT)

        with self.assertRaises(Animal.DoesNotExist):
            Animal.objects.get(id=animal.id)

    def test_upload_file(self):
        animal = Animal.objects.first()
        client = APIClient()

        # Create a mock file
        mock_file = SimpleUploadedFile(
            "test_model.obj", b"mock file content", content_type="application/octet-stream")

        # Perform the upload
        response = client.post(
            f'/animals/animal/{animal.id}/upload/',
            {'file': mock_file},
            format='multipart'
        )

        self.assertEqual(response.status_code, HTTPStatus.CREATED)

        animal.refresh_from_db()

        self.assertIsNotNone(animal.model)
        self.assertTrue("test_model" in animal.model.name)
        self.assertTrue(animal.model.name.endswith('.obj'))


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
