import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ Item ])
  ],
  exports: [ TypeOrmModule ]
})
export class UploadsModule {}
