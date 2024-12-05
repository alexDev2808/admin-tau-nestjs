import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { join } from 'path';
import { existsSync } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class UploadsService {

  constructor(
    @InjectRepository(Item)
    private readonly uploadRepository: Repository<Item>
  ) {}

  getStaticProductImage( imageName: string ) {
    const path = join( __dirname, '../../static/uploads/', imageName )

    if( !existsSync(path) ) throw new BadRequestException(`No product found with image ${ imageName }`)

    return path;
  }

  async create(createUploadDto: CreateUploadDto) {
    try {
      const { name, staticUrl } = createUploadDto;
      const upload = this.uploadRepository.create({
        name,
        staticUrl
      })

      await this.uploadRepository.save( upload )
      return upload
      
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  // Save post with the name and the staticUrl for item in DB
  async save( name: string, imagePath: string ) {
    try {
      const saveData = this.uploadRepository.create({
        name,
        staticUrl: imagePath
      })

      return await this.uploadRepository.save( saveData )
      
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  // Return ALL items in DataBase, includes pagination, offset
  async findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto;
    const items = await this.uploadRepository.find({
      take: limit,
      skip: offset
    })

    return items;  
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }

  private handleDBErrors(error: any): never {
    if( error.code === '23505' ) throw new BadRequestException( error.detail )
    if( error.code === '23502' ) throw new BadRequestException( error.detail )
    
    console.log(error);
    throw new InternalServerErrorException('Please check server logs')
    
  }
}
