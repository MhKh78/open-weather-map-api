// src/entity/Weather.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Weather {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "city_name" })
  cityName!: string;

  @Column()
  country!: string;

  @Column("float")
  lat!: number;

  @Column("float")
  lon!: number;

  @Column("float")
  temperature?: number;

  @Column()
  description?: string;

  @Column("int")
  humidity?: number;

  @Column("float")
  windSpeed?: number;

  @Column({ type: "timestamp" })
  fetchedAt!: Date;

  @CreateDateColumn({ type: "timestamp", default: "NOW()" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
