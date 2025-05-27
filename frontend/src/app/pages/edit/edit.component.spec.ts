import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditComponent } from './edit.component';
import {provideRouter, ActivatedRoute, ActivatedRouteSnapshot, Router} from '@angular/router';
import { AnimalGateway } from '../../lib/services/animal.gateway';
import { ToastService } from '../../lib/services/toast.service';
import {of, throwError} from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { Animal } from '../../lib/services/animal.model';
import {IAnimal} from '../../lib/services/animal.types';

describe('EditComponent', () => {
  let component: EditComponent;
  let fixture: ComponentFixture<EditComponent>;
  let animalGatewayMock: jasmine.SpyObj<AnimalGateway>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let activatedRouteMock: jasmine.SpyObj<ActivatedRoute>;
  let routerMock: jasmine.SpyObj<Router>;

  let animalData: IAnimal;
  let mockAnimal: Animal;

  beforeEach(async () => {

    animalData = {
      id: 1,
      name: 'Lion',
      weight: 200,
      extinct_since: 1900,
      super_power: 'Roar',
      model: 'lion-model',
    };

    animalGatewayMock = jasmine.createSpyObj<AnimalGateway>(
      'AnimalGateway',
      ['getAnimal', 'updateAnimal', 'createAnimal', 'uploadFile']
    );
    toastServiceMock = jasmine.createSpyObj<ToastService>('ToastService', ['setMessage']);

    activatedRouteMock = jasmine.createSpyObj<ActivatedRoute>('ActivatedRoute', [],
      { snapshot: { params: {}  } as ActivatedRouteSnapshot}
    );

    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EditComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AnimalGateway, useValue: animalGatewayMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock},
        { provide: Router, useValue: routerMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeInstanceOf(EditComponent)
  });

  describe('if the form is invalid', () => {
    beforeEach(() => {
      component.form.setValue({
        name: null,
        weight: null,
        superPower: null,
        extinctSince: null,
        model: null,
      });
      fixture.detectChanges();
    });

    it('should not call createAnimal or updateAnimal', async () => {
      await component.save();

      expect(animalGatewayMock.createAnimal).not.toHaveBeenCalled();
      expect(animalGatewayMock.updateAnimal).not.toHaveBeenCalled();
    });

    it('should not call uploadFile', async () => {
      const file = new File(['content'], 'test-file.txt');
      component.onFileInoutChange({ target: { files: [file] } } as unknown as Event);

      await component.save();

      expect(animalGatewayMock.uploadFile).not.toHaveBeenCalled();
    });

    it('should not navigate to the home page', async () => {
      await component.save();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe(' if animalId is present', () => {

    beforeEach(() => {
      ((Object.getOwnPropertyDescriptor(activatedRouteMock, 'snapshot'))!.get as jasmine.Spy)
      .and.returnValue({ params: {id : 1 }});
    })


    beforeEach(( ) => {
      mockAnimal = new Animal({...animalData});
      animalGatewayMock.getAnimal.and.returnValue(of(mockAnimal));
      fixture.detectChanges()
    })


    it('should load animal data on init', () => {
      expect(animalGatewayMock.getAnimal).toHaveBeenCalledOnceWith(1);
      expect(component.form.value).toEqual({
        name: animalData.name,
        weight: animalData.weight,
        superPower: animalData.super_power,
        extinctSince: animalData.extinct_since,
        model: null,
      });
      expect(component.modelUrl).toBe('lion-model');
    });

    describe('if no file is given', () => {

      it('should update an existing animal without a file', async () => {

        const updateData: Omit<IAnimal, 'id' | 'model'> = {
          name: 'Updated Lion',
          weight: 250,
          super_power: 'Stronger Roar',
          extinct_since: 1950,
        }

        const updatedAnimal: Animal = new Animal({
          ...animalData,
          ...updateData
        });
        animalGatewayMock.updateAnimal.and.returnValue(of(updatedAnimal));
        component.form.setValue({
          name: updateData.name,
          weight: updateData.weight,
          superPower: updateData.super_power,
          extinctSince: updateData.extinct_since,
          model: null,
        });

        await component.save();

        expect(animalGatewayMock.updateAnimal).toHaveBeenCalledOnceWith(animalData.id, {
          name: updateData.name,
          weight: updateData.weight,
          super_power: updateData.super_power,
          extinct_since: updateData.extinct_since,
        });
        expect(animalGatewayMock.uploadFile).not.toHaveBeenCalled();
        expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Tier gespeichert');
      })

      it('should not try to upload the file', async () => {
        await component.save();
        expect(animalGatewayMock.uploadFile).not.toHaveBeenCalled();
      })

      describe('if saving fails', () => {
        beforeEach(() => {
          animalGatewayMock.updateAnimal.and.returnValue(throwError(() => new Error('Error')));
        })

        it('should show an error message if updating fails', async () => {
          await component.save();

          expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Ooops, da ist etwas schiefgelaufen');
        })

        it('should not navigate to the home page', async () => {
          await component.save();
          expect(routerMock.navigate).not.toHaveBeenCalled();
        })
      })
    })

    describe('if a new file is given', () => {

      let file: File;

      beforeEach(() => {

        file = new File(['content'], 'test-file.txt');

        component.onFileInoutChange(
          {target: {files: [file]}} as unknown as Event
        );
      })

      it('should update an existing animal and upload a file', async () => {
        const updateData: Omit<IAnimal, 'id' | 'model'> = {
          name: 'Updated Lion',
          weight: 250,
          super_power: 'Stronger Roar',
          extinct_since: 1950,
        }

        const updatedAnimal: Animal = new Animal({
          ...animalData,
          ...updateData
        });
        animalGatewayMock.updateAnimal.and.returnValue(of(updatedAnimal));
        animalGatewayMock.uploadFile.and.returnValue(of(updatedAnimal));
        component.form.setValue({
          name: updateData.name,
          weight: updateData.weight,
          superPower: updateData.super_power,
          extinctSince: updateData.extinct_since,
          model: null,
        });

        await component.save();

        expect(animalGatewayMock.updateAnimal).toHaveBeenCalledOnceWith(animalData.id, {
          name: updateData.name,
          weight: updateData.weight,
          super_power: updateData.super_power,
          extinct_since: updateData.extinct_since,
        });
        expect(animalGatewayMock.uploadFile).toHaveBeenCalledOnceWith(animalData.id, file);
        expect(animalGatewayMock.updateAnimal).toHaveBeenCalledBefore(animalGatewayMock.uploadFile);
        expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Tier gespeichert');
      })

      describe('if updating fails', () => {

        beforeEach(() => {
          animalGatewayMock.updateAnimal.and.returnValue(throwError(() => new Error('Error')));
        })

        it('should show an error message if updating fails', async () => {
          await component.save();

          expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Ooops, da ist etwas schiefgelaufen');
        })

        it('should not try to upload the file', async () => {
          await component.save();
          expect(animalGatewayMock.uploadFile).not.toHaveBeenCalled();
        })

        it('should not navigate to the home page', async () => {
          await component.save();
          expect(routerMock.navigate).not.toHaveBeenCalled();
        })
      })

      describe('if uploading fails', () => {
        beforeEach(() => {
          animalGatewayMock.uploadFile.and.returnValue(throwError(() => new Error('Upload Error')));
        })

        it('should show an error message if uploading fails', async () => {
          await component.save();

          expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Ooops, da ist etwas schiefgelaufen');
        })

        it('should not navigate to the home page', async () => {
          await component.save();
          expect(routerMock.navigate).not.toHaveBeenCalled();
        })
      })

    })

  })

  describe('if no animalId is present', () => {
    beforeEach(() => {
      ((Object.getOwnPropertyDescriptor(activatedRouteMock, 'snapshot'))!.get as jasmine.Spy)
        .and.returnValue({ params: { } });
      fixture.detectChanges();
    });

    it('should create a new animal without a file', async () => {
      const newAnimal: Animal = new Animal({ ...animalData });

      animalGatewayMock.createAnimal.and.returnValue(of(newAnimal));
      component.form.setValue({
        name: animalData.name,
        weight: animalData.weight,
        superPower: animalData.super_power,
        extinctSince: animalData.extinct_since,
        model: null,
      });

      await component.save();

      expect(animalGatewayMock.createAnimal).toHaveBeenCalledOnceWith({
        name: animalData.name,
        weight: animalData.weight,
        extinct_since: animalData.extinct_since,
        super_power: animalData.super_power,
      });
      expect(animalGatewayMock.uploadFile).not.toHaveBeenCalled();
      expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Tier gespeichert');
    });

    it('should create a new animal and upload a file', async () => {
      const newAnimal: Animal = new Animal({ ...animalData });

      const file = new File(['content'], 'test-file.txt');
      component.onFileInoutChange({ target: { files: [file] } } as unknown as Event);

      animalGatewayMock.createAnimal.and.returnValue(of(newAnimal));
      animalGatewayMock.uploadFile.and.returnValue(of(newAnimal));
      component.form.setValue({
        name: animalData.name,
        weight: animalData.weight,
        superPower: animalData.super_power,
        extinctSince: animalData.extinct_since,
        model: null,
      });

      await component.save();

      expect(animalGatewayMock.createAnimal).toHaveBeenCalledOnceWith({
        name: animalData.name,
        weight: animalData.weight,
        extinct_since: animalData.extinct_since,
        super_power: animalData.super_power,
      });
      expect(animalGatewayMock.uploadFile).toHaveBeenCalledOnceWith(animalData.id, file);
      expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Tier gespeichert');
    });

    describe('if saving fails', () => {
      beforeEach(() => {
        animalGatewayMock.createAnimal.and.returnValue(throwError(() => new Error('Error')));
        component.form.setValue({
          name: animalData.name,
          weight: animalData.weight,
          superPower: animalData.super_power,
          extinctSince: animalData.extinct_since,
          model: null,
        });

      });

      it('should show an error message if creating fails', async () => {
        await component.save();

        expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Ooops, da ist etwas schiefgelaufen');
      });

      it('should not try to upload the file', async () => {
        const file = new File(['content'], 'test-file.txt');
        component.onFileInoutChange({ target: { files: [file] } } as unknown as Event);

        await component.save();

        expect(animalGatewayMock.uploadFile).not.toHaveBeenCalled();
      });

      it('should not navigate to the home page', async () => {
        await component.save();
        expect(routerMock.navigate).not.toHaveBeenCalled();
      });
    });

    describe('if uploading fails', () => {
      beforeEach(() => {
        const newAnimal: Animal = new Animal({ ...animalData });

        animalGatewayMock.createAnimal.and.returnValue(of(newAnimal));
        animalGatewayMock.uploadFile.and.returnValue(throwError(() => new Error('Upload Error')));
      });

      it('should show an error message if uploading fails', async () => {
        const file = new File(['content'], 'test-file.txt');
        component.onFileInoutChange({ target: { files: [file] } } as unknown as Event);

        component.form.setValue({
          name: animalData.name,
          weight: animalData.weight,
          superPower: animalData.super_power,
          extinctSince: animalData.extinct_since,
          model: null,
        });

        await component.save();

        expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Ooops, da ist etwas schiefgelaufen');
      });

      it('should not navigate to the home page', async () => {
        const file = new File(['content'], 'test-file.txt');
        component.onFileInoutChange({ target: { files: [file] } } as unknown as Event);

        await component.save();

        expect(routerMock.navigate).not.toHaveBeenCalled();
      });
    });
  });


  it('should handle file input changes', () => {
    const file = new File(['content'], 'test-file.txt');
    const event = { target: { files: [file] } } as unknown as Event;

    component.onFileInoutChange(event);

    expect(component['newFile']).toBe(file);
  });

  it('should save a new animal and upload a file', async () => {
    const mockAnimal: Animal = new Animal({
      id: 1,
      name: 'Tiger',
      weight: 300,
      extinct_since: 2000,
      super_power: 'Strength',
      model: null,
    })
    animalGatewayMock.createAnimal.and.returnValue(of(mockAnimal));
    animalGatewayMock.uploadFile.and.returnValue(of(mockAnimal));
    component.form.setValue({
      name: 'Tiger',
      weight: 300,
      superPower: 'Strength',
      extinctSince: 2000,
      model: null,
    });
    component['newFile'] = new File(['content'], 'test-file.txt');

    await component.save();

    expect(animalGatewayMock.createAnimal).toHaveBeenCalledOnceWith({
      name: 'Tiger',
      weight: 300,
      extinct_since: 2000,
      super_power: 'Strength',
    });
    expect(animalGatewayMock.uploadFile).toHaveBeenCalledOnceWith(1, component['newFile']);
    expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Tier gespeichert');
  });

});
