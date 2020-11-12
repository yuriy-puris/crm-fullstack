import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from '../shared/classes/material.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  form: FormGroup;
  aSub: Subscription;

  constructor(
      private auth: AuthService,
      private router: Router,
      private route: ActivatedRoute
    ) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    });

    this.route.queryParams.subscribe((params: Params) => {
      if ( params['registered'] ) {
        MaterialService.toast('Now we can enter to system using your data');
      } else if ( params['accessDenied'] ) {
        MaterialService.toast('Need authorization');
      } else if ( params['sessionFailed'] ) {
        MaterialService.toast('Need authorization');
      }
    })
  }

  ngOnDestroy() {
    if ( this.aSub ) this.aSub.unsubscribe();
  }

  onSubmit() {
    this.form.disable();
    this.aSub = this.auth.login(this.form.value).subscribe(
      () => {
        this.router.navigate(['/overview'])
      },
      error => {
        MaterialService.toast(error.error.message);
        this.form.enable();
      }
    )
  }

}
