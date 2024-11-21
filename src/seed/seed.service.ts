import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';


@Injectable()
export class SeedService {

  constructor( private readonly productsService: ProductsService ) {}
  
  async runSeed() {
    await this.insertNewProducts();
    return 'SEED executed'
  }

  private async insertNewProducts() {
    this.productsService.deleteAllProducts();
    return true;
  }

}
