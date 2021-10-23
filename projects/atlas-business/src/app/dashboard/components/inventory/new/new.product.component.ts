import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonUtil, Constants, FirebaseUtil, Product, Unit } from 'atlas-core';

@Component({
  selector: 'new-product-dialog',
  templateUrl: 'new.product.component.html',
  styleUrls: ['./new.product.component.scss'],
})
export class NewProductComponent {
  product: Product;
  action = 'Add Product';

  url;
  imgFile;
  placeholder = true;

  blob1;
  blob2;

  readonly optionsTax = Constants.optionsTax;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public fbutil: FirebaseUtil,
    public commonUtil: CommonUtil
  ) {
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

  loadImage(){
    this.url = this.fbutil.downloadInventoryImage(this.product.id, '1.png');
    this.placeholder = false;
  }

  noPlaceholder(){
    this.placeholder = false;
  }

  submit() {
    this.product.id =
      this.product.id && this.product.id.length > 0
        ? this.product.id
        : this.fbutil.getId();

    this.fbutil
      .getProductRef('bizId')
      .doc(this.product.id)
      .set(this.fbutil.toJson(this.product))
      .catch((err) => console.log(err));

    let name;

    if (this.blob1.type === 'image/png') {
      name = '1.png';
    }

    this.fbutil.uploadInventoryImage(this.product.id, this.blob1, name).catch((error) => console.log(error));
  }

  addNewUnit() {
    if (this.isValidUnits()) {
      this.product.units.push(new Unit());
    } else {
      this.commonUtil.showSnackBar('Invalid units added!');
    }
  }

  removeUnit(index: number) {
    if (this.product.units.length === 1) {
      this.commonUtil.showSnackBar('Atleast one unit required!');
    } else {
      this.product.units.splice(index, 1);
    }
  }

  isValidUnits(): boolean {
    let isValid = true;
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
    });
    return isValid;
  }

  onFileChanged(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    if (files[0].size > 500000) {
      this.imgFile = '';
      this.commonUtil.showSnackBar('Please select a file less than 500KB');
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.imgFile = '';
      this.commonUtil.showSnackBar('Image format not supporte, use either jpg/jpeg/png');
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
