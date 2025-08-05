// src/db/entities/forecast.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { City } from "./city.entity";

@Entity()
@Unique(["city", "forecastDate"])
export class Forecast {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => City, (city) => city.forecasts, { nullable: false })
  @JoinColumn({ name: "city_id" })
  city!: City;

  @Column({ type: "date" })
  forecastDate!: string; // ISO date (YYYY-MM-DD)

  @Column("float")
  temperatureMin!: number;

  @Column("float")
  temperatureMax!: number;

  @Column()
  description!: string;

  @Column("int")
  humidity!: number;

  @Column("float")
  windSpeed!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt?: Date;
}
