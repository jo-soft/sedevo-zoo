import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { OverviewComponent } from './overview.component';
import { AnimalsGateway } from '../../lib/services/animals/animals.gateway';
import { ToastService } from '../../lib/services/toast/toast.service';
import { provideRouter } from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import {HttpParams} from '@angular/common/http';
import {Animal} from '../../lib/services/animals/animal.model';
import {By} from '@angular/platform-browser';
import {ModalComponent} from '../../lib/components/modal/modal.component';
import {ModelViewerComponent} from '../../lib/components/model-viewer/model-viewer.component';
import {WebSocketService} from '../../lib/services/websocket/websockets.service';
import {IWebsocketMessage} from '../../lib/services/websocket/websockets.types';
import {AnimalWebsocketMessageTypeEnum, IAnimal} from '../../lib/services/animals/animals.types';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let animalGatewayMock: jasmine.SpyObj<AnimalsGateway>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let webSocketServiceMock: jasmine.SpyObj<WebSocketService>;

  let websocketDeleteStream: Subject<IWebsocketMessage<number, AnimalWebsocketMessageTypeEnum.Deleted>>
  let websocketUpdateCreateStream: Subject<IWebsocketMessage<IAnimal, AnimalWebsocketMessageTypeEnum.Created | AnimalWebsocketMessageTypeEnum.Updated>>;

  let animals: Animal[];

  beforeEach(async () => {
    animals = [
      new Animal({
        id: 1,
        name: 'Lion',
        weight: 190,
        extinct_since: 234,
        model: 'http://example.com/lion.glb',
        super_power: 'Roar',
      }),
      new Animal({
        id: 2,
        name: 'Tiger',
        weight: 220,
        extinct_since: 200,
        model: 'http://example.com/tiger.glb',
        super_power: 'Stealth',
      }),
    ]

    websocketDeleteStream = new Subject<IWebsocketMessage<number, AnimalWebsocketMessageTypeEnum.Deleted>>();
    websocketUpdateCreateStream = new Subject<IWebsocketMessage<IAnimal, AnimalWebsocketMessageTypeEnum.Created | AnimalWebsocketMessageTypeEnum.Updated>>();

    animalGatewayMock = jasmine.createSpyObj<AnimalsGateway>('AnimalsGateway', ['getAnimals', 'deleteAnimal']);
    animalGatewayMock.getAnimals.and.returnValue(of(animals));
    toastServiceMock = jasmine.createSpyObj<ToastService>('ToastService', ['setMessage']);

    webSocketServiceMock = jasmine.createSpyObj<WebSocketService>('WebSocketService', ['subscribe']);
    webSocketServiceMock.subscribe.withArgs([AnimalWebsocketMessageTypeEnum.Deleted]).and.returnValue(websocketDeleteStream);
    webSocketServiceMock.subscribe.withArgs([AnimalWebsocketMessageTypeEnum.Updated, AnimalWebsocketMessageTypeEnum.Created])
      .and.returnValue(websocketUpdateCreateStream);

    await TestBed.configureTestingModule({
      imports: [OverviewComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        {provide: AnimalsGateway, useValue: animalGatewayMock},
        {provide: ToastService, useValue: toastServiceMock},
        {provide: WebSocketService, useValue: webSocketServiceMock},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeInstanceOf(OverviewComponent)
  });

  describe('constructor', () => {

    let setAnimalsSpy: jasmine.Spy;

    beforeEach(
      () => {
        setAnimalsSpy = spyOn(component.animals, 'set').and.callThrough();
      }
    )

    describe('WebSocket Created Event', () => {

      let message: IWebsocketMessage<IAnimal, AnimalWebsocketMessageTypeEnum.Created>;
      let newAnimal: Animal;

      beforeEach(() => {
        message = {
          type: AnimalWebsocketMessageTypeEnum.Created,
          data: { id: 3, name: 'Elephant', weight: 500, extinct_since: 231, model: '', super_power: 'Strength' },
        };
        newAnimal = new Animal(message.data);
      })

      it('should add the new animal to the list', () => {
        websocketUpdateCreateStream.next(message);

        expect(component.animals.value()).toEqual([
          ...animals,
          newAnimal,
        ]);
      });

      it('should display a toast message indicating external update', () => {
        websocketUpdateCreateStream.next(message);

        expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Tiere wureden extern aktualisiert');
        expect(setAnimalsSpy).toHaveBeenCalledBefore(toastServiceMock.setMessage);
      });
    });

    describe('WebSocket Deleted Event', () => {
      let message: IWebsocketMessage<number, AnimalWebsocketMessageTypeEnum.Deleted>;

      beforeEach(() => {
        message = {
          type: AnimalWebsocketMessageTypeEnum.Deleted,
          data: 1, // id of Lion
        };
      });

      it('should remove the animal from the list', () => {
        websocketDeleteStream.next(message);

        expect(component.animals.value()).toEqual([
          animals[1]
        ]);
      });

      it('should display a toast message indicating external update', () => {
        websocketDeleteStream.next(message);

        expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Tiere wureden extern aktualisiert');
        expect(setAnimalsSpy).toHaveBeenCalledBefore(toastServiceMock.setMessage);
      });
    });

    describe('WebSocket Updated Event', () => {
      let message: IWebsocketMessage<IAnimal, AnimalWebsocketMessageTypeEnum.Updated>;
      let updatedAnimal: Animal;

      beforeEach(() => {
        message = {
          type: AnimalWebsocketMessageTypeEnum.Updated,
          data: { id: 2, name: 'Tiger', weight: 250, extinct_since: 199, model: '', super_power: 'Growl' },
        };
        updatedAnimal = new Animal(message.data);
      });

      it('should update the animal in the list', fakeAsync(() => {
        websocketUpdateCreateStream.next(message);
        expect(component.animals.value()).toEqual([
          animals[0], // Lion remains unchanged
          updatedAnimal,
        ]);
      }));

      it('should display a toast message indicating external update', () => {
        websocketUpdateCreateStream.next(message);

        expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Tiere wureden extern aktualisiert');
        expect(setAnimalsSpy).toHaveBeenCalledBefore(toastServiceMock.setMessage);
      });
    });

  })

  describe('if showModelModal is called', () => {

    it('should set modelUrl to the URL given in the animal', () => {
      const animal: Animal = new Animal({
        id: 1,
        name: 'Lion',
        weight: 190,
        extinct_since: 234,
        model: 'http://example.com/lion.glb',
        super_power: 'Roar',
      })
      component.showModelModal(animal);
      expect(component.modelUrl).toBe(animal.model);
    })

    it('should render a model viewer in a modal with the model URL', () => {

      const animal: Animal = new Animal({
        id: 1,
        name: 'Lion',
        weight: 190,
        extinct_since: 234,
        model: 'http://example.com/lion.glb',
        super_power: 'Roar',
      });
      component.showModelModal(animal);
      fixture.detectChanges();
      const modalElement = fixture.debugElement.query(By.css('app-modal'));
      expect(modalElement.componentInstance).toBeInstanceOf(ModalComponent)
      const modelViewerElement = modalElement.query(By.css('app-model-viewer'));
      expect(modelViewerElement.componentInstance).toBeInstanceOf(ModelViewerComponent)
      expect(modelViewerElement.componentInstance.path).toBe(animal.model);
    })
  })

  describe('hideModelModal', () => {

    it('should set modelUrl to null', () => {
      component.modelUrl = 'http://example.com/lion.glb';
      component.hideModelModal();
      expect(component.modelUrl).toBeNull();
    })

    it('there should not be no modal in the DOM', () => {
      component.modelUrl = 'http://example.com/lion.glb';
      component.hideModelModal();
      fixture.detectChanges();
      const modalElement = fixture.debugElement.query(By.css('app-modal'));
      expect(modalElement).toBeNull();
    });

  })

  describe('deleteAnimal', () => {

    let animal: Animal;
    let reloadSpy: jasmine.Spy;

    beforeEach(() => {
      reloadSpy = spyOn(component.animals, 'reload')
      animal = new Animal({
        id: 1,
        name: 'Lion',
        weight: 190,
        extinct_since: 234,
        model: 'http://example.com/lion.glb',
        super_power: 'Roar',
      });
    })

    describe('when called with an animal', () => {

      it('should set animalToDelete to the animal', () => {
        component.deleteAnimal(animal);
        expect(component.animalToDelete).toBe(animal);
      });

      it('should render the confirm modal with the animal name', () => {
        component.deleteAnimal(animal);
        fixture.detectChanges();
        const modalElement = fixture.debugElement.query(By.css('app-modal'));
        expect(modalElement.componentInstance).toBeInstanceOf(ModalComponent);
        expect(modalElement.componentInstance.title).toBe('Tier Löschen');
        expect(modalElement.componentInstance.closeText).toBe('Löschen');
        expect(modalElement.componentInstance.dismissText).toBe('Abbrechen');

        expect(modalElement.query(By.css('p')).nativeElement.textContent.trim()).toBe('Soll Lion wirklich gelöscht werden?');
      })
    })

    describe('calling onDeleteClosed with closed true', () => {

      beforeEach(() => {
        component.animalToDelete = animal;
      })

      it('should call the deleteAnimal method of the AnimalGateway with the animal ID', fakeAsync(() => {
        component.onDeleteClosed(true);
        tick();
        expect(animalGatewayMock.deleteAnimal).toHaveBeenCalledOnceWith(animal.id);
      }));

      describe('if the deleteAnimal call is successful', () => {

        beforeEach(() => {
          animalGatewayMock.deleteAnimal.and.returnValue(of(void 0));
        })

        it('should reload the animals and show a success message', async () => {
          await component.onDeleteClosed(true);
          expect(reloadSpy).toHaveBeenCalledTimes(1)
          expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Tier gelöscht');
        });

        it('should set animalToDelete to null', () => {
          component.onDeleteClosed(false);
          expect(component.animalToDelete).toBeNull();
        });
      })

      describe('if the deleteAnimal call fails', () => {
        beforeEach(() => animalGatewayMock.deleteAnimal.and.returnValue(
          throwError(() => new Error('Delete failed'))
          )
        )
        it('should not reload the animals and show an error message', async () => {
          await component.onDeleteClosed(true);
          expect(reloadSpy).not.toHaveBeenCalled();
          expect(toastServiceMock.setMessage).toHaveBeenCalledOnceWith('Oops, da ist etwas schief gelaufen');
        });

        it('should set animalToDelete to null', () => {
          component.onDeleteClosed(false);
          expect(component.animalToDelete).toBeNull();
        });
      })

    })

    describe('calling onDeleteClosed with closed false', () => {
      beforeEach(() => {
        component.animalToDelete = animal;
      })

      it('should not call the deleteAnimal method of the AnimalGateway', () => {
        component.onDeleteClosed(false);
        expect(animalGatewayMock.deleteAnimal).not.toHaveBeenCalled();
      });

      it('should not reload the animals', () => {
        component.onDeleteClosed(false);
        expect(reloadSpy).not.toHaveBeenCalled();
      });

      it('should show no message', () => {
        component.onDeleteClosed(false);
        expect(toastServiceMock.setMessage).not.toHaveBeenCalled();
      });

      it('should set animalToDelete to null', () => {
        component.onDeleteClosed(false);
        expect(component.animalToDelete).toBeNull();
      });
    })
  })

  describe('animals resource', () => {

    beforeEach(() => fixture.detectChanges())

    it('should load animals from the AnimalGateway', () => {
      expect(component.animals.value()).toEqual(animals);
    });

    it('should call the API when the form changes', fakeAsync(() => {
      component.searchForm.setValue({
        name: 'Lion',
        weight: null,
        extinctSince: null,
      });
      fixture.detectChanges();

      expect(animalGatewayMock.getAnimals).toHaveBeenCalledTimes(1);

      tick(300); // Simulate debounce time
      fixture.detectChanges();

      const expectedParams = new HttpParams()
        .append('name', 'Lion');

      expect(animalGatewayMock.getAnimals).toHaveBeenCalledTimes(2);
      expect(animalGatewayMock.getAnimals).toHaveBeenCalledWith(expectedParams);
    }));

    it('should call the API when the order changes', () => {
      component.nameOrder.set('name_asc');

      fixture.detectChanges();

      const expectedParams = new HttpParams()
        .append('order[]', 'name_asc')
      expect(animalGatewayMock.getAnimals).toHaveBeenCalledWith(expectedParams);
    });
  });
})
