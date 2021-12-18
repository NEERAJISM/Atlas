import { Component } from '@angular/core';
import { Product, Unit } from 'atlas-core';

class CartItem {
  name = '';
  qty = 1;
  unit = '';
  price = 0;
}

@Component({
  selector: 'app-oms',
  templateUrl: './oms.component.html',
})
export class OmsComponent {
  display = true;

  items: Product[] = [];

  search: string = '';
  displayMap: Map<number, boolean> = new Map();

  unitDisplayMap: Map<number, number> = new Map();
  cartMap: Map<number, CartItem> = new Map();

  constructor() {
    this.init();
  }

  init() {
    const unit1 = new Unit();
    unit1.unit = '500 gm';
    unit1.price = 500;

    const unit2 = new Unit();
    unit2.unit = '1 kg';
    unit2.price = 1000;

    const unit3 = new Unit();
    unit3.unit = '5 kg';
    unit3.price = 2500;

    const product1 = new Product();
    product1.name = 'Veg Pasta';
    product1.units.push(unit1);
    product1.units.push(unit2);
    product1.units.push(unit3);
    product1.photoUrl.push('assets/images/profile/food1.jpg');

    const product2 = new Product();
    product2.name = 'French Toast';
    product2.units.push(unit1);
    product2.units.push(unit2);
    product2.units.push(unit3);
    product2.photoUrl.push('assets/images/profile/food2.jpg');

    const product3 = new Product();
    product3.name = 'Yoghurt';
    product3.units.push(unit1);
    product3.units.push(unit2);
    product3.units.push(unit3);
    product3.photoUrl.push('assets/images/profile/food3.jpg');

    const product4 = new Product();
    product4.name = 'Pancake';
    product4.units.push(unit1);
    product4.units.push(unit2);
    product4.units.push(unit3);
    product4.photoUrl.push('assets/images/profile/food4.jpg');

    this.items.push(product1);
    this.items.push(product2);
    this.items.push(product3);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);


    for (let i = 0; i <= this.items.length; i++) {
      this.unitDisplayMap.set(i, 0);
      this.displayMap.set(i, true);
    }
  }

  addToCart(i: number) {
    if (this.cartMap.has(i)) {
      this.cartMap.get(i).qty++;
    } else {
      const item = new CartItem();
      item.name = this.items[i].name;
      var u = this.items[i].units[this.unitDisplayMap.get(i)];
      item.unit = u.unit;
      item.price = u.price;
      this.cartMap.set(i, item);
    }
  }

  removeFromCart(i: number) {
    this.cartMap.get(i).qty--;
    if (this.cartMap.get(i).qty === 0) {
      this.cartMap.delete(i);
    }
  }

  selectionChange(event, i: number) {
    this.unitDisplayMap.set(i, this.items[i].units.indexOf(event.detail.value));
    for (let index in this.items[i].units) {
      var u = this.items[i].units[index];
      if (u.unit === event.detail.value) {
        this.unitDisplayMap.set(i, Number(index));

        if (this.cartMap.has(i)) {
          this.cartMap.get(i).unit = u.unit;
          this.cartMap.get(i).price = u.price;
        }
        return;
      }
    }
  }

  updateSearchResults(){
    this.items.forEach((item, i) => {
      this.displayMap.set(i, item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1);
    });
  }
}
