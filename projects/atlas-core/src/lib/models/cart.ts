export class Cart {
  items: CartItem[] = [];
}

export class CartItem {
  itemId: string;
  unit: string;
  qty: number;
}
