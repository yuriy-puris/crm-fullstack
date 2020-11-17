import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MaterialInstance, MaterialService } from '../shared/classes/material.service';
import { Filter, Order } from '../shared/interfaces';
import { OrdersService } from '../shared/services/orders.service';

const STEP = 2;

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss']
})
export class HistoryPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('tooltip') tooltipRef: ElementRef;
  oSub: Subscription;
  tooltip: MaterialInstance;
  isFilterVisible: boolean = false;
  loading: boolean = false;
  reloading: boolean = false;
  orders: Order[] = [];
  offset = 0;
  limit = STEP;
  noMoreOrders: boolean = false;
  filter: Filter = {};

  constructor(
    private ordersService: OrdersService
  ) { }

  ngOnInit() {
    this.reloading = true;
    this.fetch();
  }

  ngOnDestroy() {
    this.tooltip.destroy();
    this.oSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.tooltip = MaterialService.initTooltip(this.tooltipRef);
  }

  private fetch() {
    const params = Object.assign({}, this.filter, {
      offset: this.offset,
      limit: this.limit
    });
    this.oSub = this.ordersService.fetch(params).subscribe(orders => {
      this.orders = this.orders.concat(orders);
      this.noMoreOrders = orders.length < STEP;
      this.loading = false;
      this.reloading = false;
    })
  }

  onLoadMore() {
    this.loading = true;
    this.offset += STEP;
    this.fetch();
  }

  applyFilter( filter: Filter ) {
    this.orders = [];
    this.offset = 0;
    this.filter = filter;
    this.reloading = true;
    this.fetch();
  }

  isFiltered(): Boolean {
    return Object.keys(this.filter).length !== 0;
  }

}
