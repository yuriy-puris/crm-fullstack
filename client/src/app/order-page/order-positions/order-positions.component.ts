import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { MaterialService } from 'src/app/shared/classes/material.service';
import { PositionsService } from 'src/app/shared/services/positions.service';
import { Position } from '../../shared/interfaces';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-positions',
  templateUrl: './order-positions.component.html',
  styleUrls: ['./order-positions.component.scss']
})
export class OrderPositionsComponent implements OnInit {

  positions$: Observable<Position[]>

  constructor(
    private route: ActivatedRoute,
    private positionsService: PositionsService,
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.positions$ = this.route.params
      .pipe(
        switchMap(
          (params: Params) => {
            return this.positionsService.fetch(params['id'])
          }
        ),
        map(
          (positions: Position[]) => {
            return positions.map(pos => {
              pos.quantity = 1;
              return pos;
            })
          }
        )
      )
  }

  addToOrder(position:Position) {
    MaterialService.toast(`Added x${position.quantity}`);
    this.orderService.add(position);
  }

}
