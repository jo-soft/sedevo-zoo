import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {LoadingService} from '../../services/loading.service';
import {AsyncPipe} from '@angular/common';
import {LoadingSpinnerComponent} from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    AsyncPipe,
    LoadingSpinnerComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public loadingService: LoadingService = inject(LoadingService)

}
