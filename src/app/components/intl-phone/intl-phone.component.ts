import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { getAsYouType } from 'awesome-phonenumber';

@Component({
  selector: 'app-intl-phone',
  templateUrl: './intl-phone.component.html',
  styleUrls: ['./intl-phone.component.css'],
})
export class IntlPhoneComponent implements AfterViewInit {
  public form: UntypedFormGroup;
  public countries: string[] = ['US', 'SE', 'MX'];

  constructor(private formBuilder: UntypedFormBuilder) {
    this.form = this.formBuilder.group({
      phone: [''],
      select: [this.countries[0]],
    });
  }

  ngAfterViewInit() {
    this.form.controls['phone'].addValidators(Validators.required);
    this.form.controls['phone'].addValidators(this.phoneValid);
  }

  public phoneInput(event: any) {
    const ele = event.target;
    const rawNumber: string = ele.value.replace(/[^0-9]+/g, '');
    const ayt = getAsYouType(this.form.controls['select'].value);
    rawNumber.split('').forEach((e) => {
      ayt.addChar(e);
    });

    this.form.controls['phone'].setValue(ayt.number());
  }

  public requiredError() {
    const control = this.form.controls['phone'];
    return (
      control.status !== 'VALID' &&
      control.touched === true &&
      control.errors?.['required']
    );
  }

  public validationError() {
    const control = this.form.controls['phone'];
    return (
      control.status !== 'VALID' &&
      control.touched === true &&
      control.errors?.['aytIssues']
    );
  }

  private phoneValid(control: AbstractControl) {
    const valueClean = control.value.replace(/[^0-9]+/g, '');
    const country = control.parent?.value?.select;
    const ayt = getAsYouType(country);
    valueClean.split('').forEach((e: string) => {
      ayt.addChar(e);
    });
    const status = ayt.getPhoneNumber().valid;
    if (status === true) {
      return null;
    } else {
      return {
        aytIssues: true,
      };
    }
  }
}
