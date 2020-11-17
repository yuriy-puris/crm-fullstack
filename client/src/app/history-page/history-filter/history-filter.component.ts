import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { MaterialDatePicker, MaterialService } from 'src/app/shared/classes/material.service';
import { Filter } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-history-filter',
  templateUrl: './history-filter.component.html',
  styleUrls: ['./history-filter.component.scss']
})
export class HistoryFilterComponent implements OnDestroy, AfterViewInit {

  @Output() onFilter: EventEmitter<Filter> = new EventEmitter();

  @ViewChild('start') startRef: ElementRef;
  @ViewChild('end') endRef: ElementRef;

  start: MaterialDatePicker;
  end: MaterialDatePicker
  order: number;

  isValid: boolean = true;

  constructor() { }

  ngOnDestroy() {
    this.start.destroy();
    this.end.destroy();
  }

  ngAfterViewInit() {
    this.start = MaterialService.initDatePicker(this.startRef, this.validate.bind(this));
    this.end = MaterialService.initDatePicker(this.endRef, this.validate.bind(this));
  }

  validate() {
    if ( !this.start.date || !this.end.date ) {
      this.isValid = true;
      return;
    }
    this.isValid = this.start.date < this.end.date;
  }

  submitFilter() {
    const filter: Filter = {};

    if ( this.order ) filter.order = this.order;
    if ( this.start.date ) filter.start = this.start.date;
    if ( this.end.date ) filter.end = this.end.date;
    
    this.onFilter.emit(filter);
  }

}
