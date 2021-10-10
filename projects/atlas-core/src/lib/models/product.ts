export class Product {
  id: string;

  name: string;
  desc: string;
  serial: string;
  gst: string;

  units: Unit[] = [];
  photoUrl: string[] = [];
}

export class Unit {
  unit: string;
  price: number;
  stock: number;
}
