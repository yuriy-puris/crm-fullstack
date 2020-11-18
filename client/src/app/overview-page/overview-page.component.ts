import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { AnalyticsService } from '../shared/services/analytics.service';
import { Observable } from 'rxjs';
import { OverviewPage } from '../shared/interfaces';
import { MaterialInstance, MaterialService } from '../shared/classes/material.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.scss'],
})
export class OverviewPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('tapTarget') tabTargetRef: ElementRef;

  data$: Observable<OverviewPage>;
  tapTarget: MaterialInstance;
  yesterday = new Date();

  constructor(
    private service: AnalyticsService
  ) { }

  ngOnInit() {
    this.data$ = this.service.getOverview();
    this.yesterday.setDate(this.yesterday.getDate() - 1);
  }

  ngAfterViewInit() {
    this.tapTarget = MaterialService.initTapTarget(this.tabTargetRef);
  }

  ngOnDestroy() {
    this.tapTarget.destroy();
  }

  openInfo() {
    this.tapTarget.open();
  }

}
