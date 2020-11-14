import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialInstance, MaterialService } from 'src/app/shared/classes/material.service';
import { PositionsService } from 'src/app/shared/services/positions.service';
import { Position } from '../../../shared/interfaces';

@Component({
  selector: 'app-position-form',
  templateUrl: './position-form.component.html',
  styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('modal') modalRef: ElementRef;
  
  @Input('categoryId') categoryId: string;

  form: FormGroup;
  positions: Position[] = [];
  positionId = null;
  loading = false;
  modal: MaterialInstance;

  constructor(
    private positionsService: PositionsService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(null, [Validators.required, Validators.min(1)])
    });

    this.loading = true;
    this.positionsService.fetch(this.categoryId).subscribe(positions => {
      this.positions = positions;
      this.loading = false;
    })
  }

  ngAfterViewInit() {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  ngOnDestroy() {
    this.modal.destroy();
  }

  onSelectPosition(position: Position) {
    this.positionId = position._id;
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    });
    this.modal.open();
    MaterialService.updateTextInputs();
  }

  onAddPosition() {
    this.positionId = null;
    this.form.reset({
      name: null,
      cost: 1
    });
    this.modal.open();
    MaterialService.updateTextInputs();
  }

  onDeletePosition(event: Event, position: Position) {
    event.stopPropagation();
    const confirm = window.confirm(`Delete position "${position.name}"`);
    if ( confirm ) {
      this.positionsService.delete(position).subscribe(
        response => {
          const idx = this.positions.findIndex(pos => pos._id === position._id);
          this.positions.splice(idx, 1);
          MaterialService.toast(response.message);
        },
        error => MaterialService.toast(error.error.message)
      )
    }
  }

  onCancelModal() {
    this.modal.close();
  }

  onSubmit() {
    this.form.disable();
    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId
    };

    const completed = () => {
      this.modal.close();
      this.form.enable();
      this.form.reset({ name: '', cost: 1 });
    }

    if ( this.positionId ) {
      newPosition._id = this.positionId;
      this.positionsService.update(newPosition).subscribe(
        position => {
          const idx = this.positions.findIndex(pos => pos._id === position._id);
          this.positions[idx] = position;
          MaterialService.toast('Position updated successfully');
        },
        error => {
          MaterialService.toast(error.error.message);
        },
        completed
      )
    } else {
      this.positionsService.create(newPosition).subscribe(
        position => {
          MaterialService.toast('Position created successfully');
          this.positions.push(position);
        },
        error => {
          MaterialService.toast(error.error.message);
        },
        completed
      )
    }
  }

}
