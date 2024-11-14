import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({url: image}))
      });
      await this.productRepository.save( product );

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map( product => ({
      ...product,
      images: product.images.map( image => image.url )
    }))
  }

  async findOne(term: string) {
    let product: Product;
    
    if ( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where("LOWER(title) =LOWER(:title) or LOWER(slug) =LOWER(:slug)", {
          title: term,
          slug: term
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }
    

    if( !product ) {
      throw new NotFoundException(`term: ${term} not found in DB!`)
    }

    return product;
  }

  async findOnePlain( term: string ) {
    const { images = [], ...rest } = await this.findOne( term )
    return {
      ...rest,
      images: images.map( image => image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      images: []
    })
    if( !product ) throw new NotFoundException(`Product with ID: ${id} not found`);

    try {
      await this.productRepository.save( product );
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if( !product ){
      throw new BadRequestException(`Product ID: ${id} not found`)
    }
    this.productRepository.remove(product)
    return;
  }

  private handleDBExceptions( error: any ) {
    if(error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
    
  }
}
