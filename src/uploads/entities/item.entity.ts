
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('items')
export class Item {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    name: string

    @Column('text', {
        unique: true
    })
    imageName: string;

    @Column('text')
    staticUrl: string

}
