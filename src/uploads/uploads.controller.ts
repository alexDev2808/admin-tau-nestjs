import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Res, Query } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFilter, imageNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService
  ) {}

  @Post()
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: imageFilter,
    storage: diskStorage({
      destination: './static/uploads',
      filename: imageNamer
    })
  }))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUploadDto: CreateUploadDto
  ) {
    return this.uploadsService.save( createUploadDto, file )
  }

  @Get()
  findAll( @Query() paginationDto: PaginationDto) {
    return this.uploadsService.findAll( paginationDto );
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.uploadsService.findOne(term);
  }

  @Get('item/:imageName')
  findOneImage(
    @Res() resp: Response,
    @Param('imageName') imageName: string
  ) {
    const path = this.uploadsService.getStaticProductImage( imageName );

    resp.sendFile( path )
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUploadDto: UpdateUploadDto) {
    return this.uploadsService.update(+id, updateUploadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadsService.remove(id);
  }
}
