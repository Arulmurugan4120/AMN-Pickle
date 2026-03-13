import { BaseRepository } from './baseRepository';
import Product from '../models/Product';
import { IProduct } from '../interfaces/models';

class ProductRepository extends BaseRepository<any> {
  constructor() {
    super(Product as any);
  }

  async findByProductId(id: string) {
    return this.findOne({ id });
  }

  async seedProducts(products: IProduct[]) {
    return Product.insertMany(products);
  }
}

export default new ProductRepository();
