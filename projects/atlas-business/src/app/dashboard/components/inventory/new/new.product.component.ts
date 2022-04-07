import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService, CommonUtil, Constants, FirebaseUtil, Product, Unit } from 'atlas-core';
import { AppService } from 'projects/atlas-business/src/app/app.service';

@Component({
  selector: 'new-product-dialog',
  templateUrl: 'new.product.component.html',
  styleUrls: ['./new.product.component.scss'],
})
export class NewProductComponent {
  readonly optionsTax = Constants.optionsTax;

  product: Product;
  action = 'Add Product';
  unitSet: Set<string> = new Set();  

  url;
  blob1;
  imgFile;
  placeholder = true;

  bizId = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public fbutil: FirebaseUtil,
    public commonUtil: CommonUtil,
    public appService: AppService,
    private auth: AuthService
  ) {
    this.auth.afAuth.authState.subscribe((user) => {
      if (user) {
        this.bizId = user.uid;
        this.init(data);
      }
    });
  }

  init(data) {
    if (data) {
      this.product = data;
      this.action = 'Update Product';
      this.loadImage();
    } else {
      this.product = new Product();
      this.product.units = [];
      this.product.units.push(new Unit());
    }
  }

  loadImage() {
    this.fbutil.downloadImage(Constants.PRODUCT + '/' + this.bizId + '/' + this.product.id + '/1.png')
      .subscribe((url) => {
        this.url = url;
        this.placeholder = false;
      })
  }

  noPlaceholder() {
    this.placeholder = false;
  }

  submit() {
    this.product.id =
      this.product.id && this.product.id.length > 0
        ? this.product.id
        : this.fbutil.getId();

    this.fbutil
      .getProductRef(this.bizId)
      .doc(this.product.id)
      .set(this.fbutil.toJson(this.product))
      .catch((err) => console.log(err));

    if(this.blob1) {
      this.fbutil.uploadImage(this.blob1, Constants.PRODUCT + '/' + this.bizId + '/' + this.product.id + '/1.png').catch((error) => console.log(error));
    }
  }

  addNewUnit() {
    if (this.isValidUnits()) {
      this.product.units.push(new Unit());
    } else {
      this.appService.presentToast('Invalid units added!');
    }
  }

  removeUnit(index: number) {
    if (this.product.units.length === 1) {
      this.appService.presentToast('Atleast one unit required!');
    } else {
      this.product.units.splice(index, 1);
    }
  }

  isValidUnits(): boolean {
    let isValid = true;
    this.unitSet.clear();
    this.product.units.forEach((unit) => {
      if (
        !(
          unit.unit &&
          unit.unit.length > 0 &&
          unit.price &&
          unit.price >= 0 &&
          unit.stock &&
          unit.stock >= 0
        )
      ) {
        isValid = false;
        return;
      }
      unit.unit = unit.unit.trim();
      this.unitSet.add(unit.unit)
    });
    return this.unitSet.size === this.product.units.length;
  }

  onFileChanged(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    if (files[0].size > 500000) {
      this.imgFile = '';
      this.appService.presentToast('Please select a file less than 500KB', true);
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.imgFile = '';
      this.appService.presentToast('Image format not supported, use either jpg/jpeg/png', true);
      return;
    }

    this.blob1 = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (e) => {
      this.url = reader.result;
      this.placeholder = false;
    };
  }

  removeImage() {
    this.imgFile = '';
    this.placeholder = true;
  }
}
