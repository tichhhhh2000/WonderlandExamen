import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecuperarPage } from './recuperar.page';
import { Router } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { AlertServiceService } from 'src/app/services/alert-service.service';
import { ToastServiceService } from 'src/app/services/toast-service.service';

describe('RecuperarPage', () => {
  let component: RecuperarPage;
  let fixture: ComponentFixture<RecuperarPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockServicebd: jasmine.SpyObj<ServicebdService>;
  let mockAlertService: jasmine.SpyObj<AlertServiceService>;
  let mockToastService: jasmine.SpyObj<ToastServiceService>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockServicebd = jasmine.createSpyObj('ServicebdService', ['verificarRespuestaSeguridad']);
    mockAlertService = jasmine.createSpyObj('AlertServiceService', ['GenerarAlerta']);
    mockToastService = jasmine.createSpyObj('ToastServiceService', ['GenerarToast']);

    TestBed.configureTestingModule({
      declarations: [RecuperarPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ServicebdService, useValue: mockServicebd },
        { provide: AlertServiceService, useValue: mockAlertService },
        { provide: ToastServiceService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería mostrar una alerta si algún campo está vacío', () => {
    // Asignamos valores vacíos a los campos
    component.email = '';
    component.preguntaSeguridad = '';
    component.respuestaSeguridad = '';

    // Llamamos a la validación
    component.validacion();

    // Verificamos que se haya mostrado una alerta diciendo "Por favor complete todos los campos"
    expect(mockAlertService.GenerarAlerta).toHaveBeenCalledWith(
      'Error',
      'Por favor complete todos los campos'
    );

    // Verificamos que no haya sido llamada la función de verificación de la respuesta
    expect(mockServicebd.verificarRespuestaSeguridad).not.toHaveBeenCalled();
  });

  it('debería proceder con la verificación si todos los campos están completos', async () => {
    // Asignamos valores completos a los campos
    component.email = 'test@example.com';
    component.preguntaSeguridad = '¿Cuál es el apellido de tu abuelo?';
    component.respuestaSeguridad = 'respuesta correcta';

    // Simulamos que la verificación de respuesta es correcta
    mockServicebd.verificarRespuestaSeguridad.and.returnValue(Promise.resolve(true));

    // Llamamos a la validación
    await component.validacion();

    // Verificamos que la función de verificación haya sido llamada con los parámetros correctos
    expect(mockServicebd.verificarRespuestaSeguridad).toHaveBeenCalledWith(
      'test@example.com', 
      '¿Cuál es el apellido de tu abuelo?', 
      'respuesta correcta'
    );

    // Verificamos que la redirección haya sido llamada con los parámetros correctos
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/recuperar-contra'], {
      queryParams: { correo: 'test@example.com' },
    });

    // Verificamos que no haya mostrado ninguna alerta
    expect(mockAlertService.GenerarAlerta).not.toHaveBeenCalled();
  });

  it('debería mostrar un mensaje de error si la respuesta de seguridad es incorrecta', async () => {
    // Asignamos valores completos a los campos
    component.email = 'test@example.com';
    component.preguntaSeguridad = '¿Cuál es el apellido de tu abuelo?';
    component.respuestaSeguridad = 'respuesta incorrecta';

    // Simulamos que la verificación de respuesta es incorrecta
    mockServicebd.verificarRespuestaSeguridad.and.returnValue(Promise.resolve(false));

    // Llamamos a la validación
    await component.validacion();

    // Verificamos que la función de verificación haya sido llamada con los parámetros correctos
    expect(mockServicebd.verificarRespuestaSeguridad).toHaveBeenCalledWith(
      'test@example.com', 
      '¿Cuál es el apellido de tu abuelo?', 
      'respuesta incorrecta'
    );

    // Verificamos que se haya mostrado un mensaje de error
    expect(mockToastService.GenerarToast).toHaveBeenCalledWith(
      'Correo o respuesta incorrectos', 2000, 'middle'
    );
  });
});
