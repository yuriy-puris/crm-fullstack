import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MaterialService } from 'src/app/shared/classes/material.service';
import { Category } from 'src/app/shared/interfaces';
import { CategoriesService } from 'src/app/shared/services/categories.services';

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss']
})
export class CategoriesFormComponent implements OnInit {

  @ViewChild('inputFile') inputFileRef: ElementRef;

  form: FormGroup;
  image: File;
  imagePreview: any = '';
  isNew = true;
  category: Category;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
    });

    this.form.disable();
    
    this.route.params
      .pipe(
        switchMap(
          (params: Params) => {
            if ( params['id'] ) {
              this.isNew = false;
              return this.categoriesService.getById(params['id']);
            }
            return of(null);
          }
        )
      )
      .subscribe(
        category => {
          if ( category ) {
            this.category = category;
            this.form.patchValue({
              name: category.name
            })
            this.imagePreview = category.imageSrc;
            MaterialService.updateTextInputs();
          }
          this.form.enable();
        },
        error => MaterialService.toast(error.error.message)
      )
  }

  onSubmit() {
    let observable$;
    this.form.disable();
    if ( this.isNew ) {
      observable$ = this.categoriesService.create(this.form.value.name, this.image);
    } else {
      observable$ = this.categoriesService.update(this.category._id, this.form.value.name, this.image);
    }
    observable$.subscribe(
      category => {
        this.category = category;
        this.form.enable();
        MaterialService.toast('Changes is saved');
      },
      error => {
        this.form.enable();
        MaterialService.toast(error.error.message);
      }
    )
  }

  deleteCategory() {
    const confirm = window.confirm(`Are you sure you want to delete category ${this.category.name}`);
    if ( confirm ) {
      this.categoriesService.delete(this.category._id)
        .subscribe(
          response => MaterialService.toast(response.message),
          error => MaterialService.toast(error.error.message),
          () => this.router.navigate(['/categories'])
        )
    }
  }

  uploadFile() {
    this.inputFileRef.nativeElement.click();
  }

  onChangeFileUpload(event: Event) {
    const file = (event.target as any).files[0];
    this.image = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

}
