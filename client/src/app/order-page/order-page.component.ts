import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialInstance, MaterialService } from '../shared/classes/material.service';
import { Order, OrderPosition } from '../shared/interfaces';
import { OrdersService } from '../shared/services/orders.service';
import { OrderService } from './order.service';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  providers: [OrderService]
})
export class OrderPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('modal') modalRef: ElementRef;

  modal: MaterialInstance;
  isRoot: boolean;
  pending: boolean = false;
  oSub: Subscription;

  constructor(
    private router: Router,
    public order: OrderService,
    private ordersService: OrdersService
  ) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if ( event instanceof NavigationEnd ) {
        this.isRoot = (event as any).url === '/order';
      }
    })
  }

  ngOnDestroy() {
    this.modal.destroy();
    if ( this.oSub ) this.oSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  onOpenModal() {
    this.modal.open();
  }

  onCancelModal() {
    this.modal.close();
  }

  onSubmit() {
    this.pending = true;
    const order: Order = {
      list: this.order.list.map(item => {
        delete item._id;
        return item;
      })
    };
    this.oSub = this.ordersService.create(order).subscribe(
      newOrder => {
        MaterialService.toast('Order created');
        this.order.clear();
      },
      error => MaterialService.toast(error.error.message),
      () => {
        this.modal.close();
        this.pending = false;
      }
    )
  }

  onRemovePosition(orderPosition: OrderPosition) {
    this.order.remove(orderPosition);
  }

}
