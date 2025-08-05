// src/entity/Weather.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Weather } from "./weather.entity";
import { Forecast } from "./forecast.entity";

@Entity()
/** On Some Unique Case:
 * New York and New York County Becaus Of Resoloution lat and lon are duplicated
 * The Most Unique Key Is Combination Of For Columns
 */
@Unique(["cityName", "country", "lat", "lon"])
export class City {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  cityName!: string;

  @Column()
  country!: string;

  @Column("float")
  lat!: number;

  @Column("float")
  lon!: number;

  // It Can Be Nullable When We Have System Level City Creation
  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdBy?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt?: Date;

  @OneToMany(() => Weather, (weather) => weather.city)
  weatherRecords!: Weather[];

  @OneToMany(() => Forecast, (forecast) => forecast.city)
  forecasts!: Forecast[];
}
