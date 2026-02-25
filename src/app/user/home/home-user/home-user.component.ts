import { Component } from '@angular/core';
import { ListProductosComponent } from "../../../components/list-productos/list-productos.component";


@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [ListProductosComponent],
  templateUrl: './home-user.component.html',
  styleUrls: ['./home-user.component.css']
})
export class HomeUserComponent {

}
