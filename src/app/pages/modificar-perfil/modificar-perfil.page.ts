import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertServiceService } from 'src/app/services/alert-service.service';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-modificar-perfil',
  templateUrl: './modificar-perfil.page.html',
  styleUrls: ['./modificar-perfil.page.scss'],
})
export class ModificarPerfilPage implements OnInit {
  userId!: number;
  usuario: string = '';
  correo: string = '';
  direccion: string = '';
  
  // Agregar variables para la pregunta y respuesta
  preguntaSeleccionada: string = '';
  respuestaSeguridad: string = '';

  // Lista de preguntas de seguridad disponibles
  preguntas: string[] = [
    '¿Cuál es el apellido de tu abuelo?',
    '¿En qué ciudad naciste?',
    '¿Cuál es el nombre de tu primera mascota?',
    '¿Cuál es el nombre de tu mejor amigo de la infancia?',
    '¿En qué escuela estudiaste?'
  ];

  constructor(
    private route: ActivatedRoute,
    private bd: ServicebdService,
    private alerta: AlertServiceService,
    private router: Router
  ) {
    const navigationState = history.state;
    if (navigationState && navigationState.usuarioSeleccionado) {
      this.userId = navigationState.usuarioSeleccionado;
    } else {
      this.alerta.GenerarAlerta('Error', 'ID de usuario no encontrado');
    }
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  async cargarPerfil() {
    if (!this.userId) {
      this.alerta.GenerarAlerta('Error', 'Usuario no encontrado');
      return;
    }

    try {
      const usuarioInfo = await this.bd.traerUsuario(this.userId);
      if (usuarioInfo) {
        this.usuario = usuarioInfo.usuario;
        this.correo = usuarioInfo.correo_usuario;
        this.direccion = usuarioInfo.direccion;
      } else {
        this.alerta.GenerarAlerta('Error', 'No se encontró información del usuario');
      }
    } catch (e) {
      this.alerta.GenerarAlerta('Error', 'No se pudo cargar el perfil');
    }
  }

  async modificarPerfil() {
    const resultado = await this.bd.modificarUsuario(this.userId, this.usuario, this.direccion);
    if (resultado) {
      this.alerta.GenerarAlerta('Éxito', 'Perfil actualizado exitosamente');
    } else {
      this.alerta.GenerarAlerta('Error', 'No se pudo actualizar el perfil');
    }
  }

  // Método para verificar la respuesta de seguridad
  async verificarPreguntaSeguridad() {
    if (!this.preguntaSeleccionada || !this.respuestaSeguridad) {
      this.alerta.GenerarAlerta('Error', 'Por favor seleccione una pregunta y responda');
      return;
    }

    try {
      const esCorrecta = await this.bd.verificarRespuestaSeguridad(this.correo, this.preguntaSeleccionada, this.respuestaSeguridad);
      if (esCorrecta) {
        this.router.navigate(['/cambiar-contra'], { queryParams: { correo: this.correo } });
      } else {
        this.alerta.GenerarAlerta('Error', 'Respuesta incorrecta');
      }
    } catch (e) {
      this.alerta.GenerarAlerta('Error', 'No se pudo verificar la respuesta');
    }
  }

}
