import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class InactividadSistema implements OnDestroy {

  private readonly tiempoInactividad = 30 * 60 * 1000;
  private subscription?: Subscription;
  private ultimaActividad = Date.now();

  constructor(
    private readonly ngZone: NgZone,
    private readonly router: Router,
    private readonly loginService: LoginService
  ) { }

  start(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.ultimaActividad = Date.now();

    this.ngZone.runOutsideAngular(() => {
      const eventosUsuario$ = merge(
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'mousedown'),
        fromEvent(document, 'click'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'scroll'),
        fromEvent(document, 'touchstart'),
        fromEvent(document, 'touchmove')
      );

      this.subscription = eventosUsuario$
        .pipe(
          switchMap(() => {
            this.ultimaActividad = Date.now();
            return timer(this.tiempoInactividad);
          })
        )
        .subscribe(() => {
          this.ngZone.run(() => {
            this.cerrarSesionPorInactividad();
          });
        });

      document.addEventListener('visibilitychange', this.validarRetornoPantalla);
    });
  }

  stop(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }

    document.removeEventListener('visibilitychange', this.validarRetornoPantalla);
  }

  private validarRetornoPantalla = (): void => {
    if (document.visibilityState !== 'visible') return;

    const tiempoSinActividad = Date.now() - this.ultimaActividad;

    if (tiempoSinActividad >= this.tiempoInactividad) {
      this.ngZone.run(() => {
        this.cerrarSesionPorInactividad();
      });
    }
  };

  private cerrarSesionPorInactividad(): void {
    if (!this.loginService.loggedIn()) return;

    this.stop();

    localStorage.clear();
    sessionStorage.clear();

    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}