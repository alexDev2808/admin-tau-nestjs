import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { join } from 'path';
import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {

  constructor(
    @InjectRepository(Item)
    private readonly uploadRepository: Repository<Item>,
    private readonly configService: ConfigService,

  ) {}

  getStaticProductImage( imageName: string ) {
    const path = join( __dirname, '../../static/uploads/', imageName )

    if( !existsSync(path) ) throw new BadRequestException(`No product found with image ${ imageName }`)

    return path;
  }


  // Save post with the name and the staticUrl for item in DB
  async save( createUploadDto: CreateUploadDto, file: Express.Multer.File ) {

    if( !file) throw new BadRequestException('Make sure the file is an image');

    const { name } = createUploadDto
    const staticUrl = `${ this.configService.get('HOST_API') }/uploads/item/${ file.filename }`

    try {
      const saveData = this.uploadRepository.create({
        name,
        imageName: file.filename,
        staticUrl
      })

      await this.uploadRepository.save( saveData )
      return { ...saveData }
      
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

  async findOne(term: string) {
    let item: Item;
    if( isUUID(term) ) {
      item = await this.uploadRepository.findOneBy({ id: term });
    } 

    if( !item ) throw new NotFoundException(`term: ${term} not found in DB`)
    return item;
  }

  update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`;
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    if( !item ) throw new BadRequestException(`Item ID: ${id} not found!`)
    const filePath = join( __dirname, '../../static/uploads/', item.imageName )
    
    try {
      await fs.unlink(filePath);
      this.uploadRepository.remove(item)
      return `Archivo eliminado correctamente: ${filePath}`
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error('Archivo no encontrado:', filePath);
      } else {
        console.error('Error eliminando archivo:', error);
      }
    }
    
  }

  private handleDBErrors(error: any): never {
    if( error.code === '23505' ) throw new BadRequestException( error.detail )
    if( error.code === '23502' ) throw new BadRequestException( error.detail )
    
    console.log(error);
    throw new InternalServerErrorException('Please check server logs')
    
  }
}
