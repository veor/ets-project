import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000): void {
    this.notificationSubject.next({ message, type });
    setTimeout(() => this.notificationSubject.next(null), duration);
  }
}
