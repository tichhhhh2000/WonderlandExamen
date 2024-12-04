import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertServiceService } from 'src/app/services/alert-service.service';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { ToastServiceService } from 'src/app/services/toast-service.service';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage implements OnInit {

  email: string = "";
  correo: string = "";
  preguntaSeguridad: string = "";
  respuestaSeguridad: string = "";

  correoVal: boolean = false;
  respuestaVal: boolean = false;

  constructor(
    private router: Router, 
    private alerta: AlertServiceService, 
    private bd: ServicebdService, 
    private toast: ToastServiceService
  ) {}

  validarCorreo(correo: string) {
    const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return patron.test(correo);
  }

  validacion() {
    if (!this.email || !this.preguntaSeguridad || !this.respuestaSeguridad) {
      this.alerta.GenerarAlerta('Error', 'Por favor complete todos los campos');
      return;
    }
  
    // Resetear las validaciones
    this.correoVal = false;
    this.respuestaVal = false;
  
    if (!this.validarCorreo(this.email)) {
      this.correoVal = true;
    }
  
    if (this.correoVal) {
      return;
    }
  
    // Llamamos al método de verificación con el correo, la pregunta y la respuesta
    this.verificarRespuesta();
  }
  
  verificarRespuesta() {
    this.bd.verificarRespuestaSeguridad(this.email, this.preguntaSeguridad, this.respuestaSeguridad).then(respuestaCorrecta => {
      if (respuestaCorrecta) {
        // Si la respuesta es correcta, redirigimos a la página de recuperación de contraseña
        this.router.navigate(['/recuperar-contra'], { queryParams: { correo: this.email } }); // Cambié 'this.correo' por 'this.email'
  
      } else {
        // Si la respuesta es incorrecta
        this.respuestaVal = true;
        this.toast.GenerarToast('Correo o respuesta incorrectos', 2000, 'middle');
      }
    }).catch(e => {
      console.error('Error al verificar la respuesta de seguridad', e);
      this.respuestaVal = true;
      this.toast.GenerarToast('Error en la verificación', 2000, 'middle');
    });
  }
  
  
  

  ngOnInit() {
  }
}
