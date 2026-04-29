import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  @Input() isLoading: boolean = false;   // control visibility
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary'; 
  @Input() mode: 'determinate' | 'indeterminate' = 'indeterminate';
}
