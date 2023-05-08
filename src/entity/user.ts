import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  birthDate!: string;

  static isValidPassword(password: string) {
    const digitRegex = /[0-9]/;
    const letterRegex = /[a-z]/;
    return password.length > 5 && digitRegex.test(password) && letterRegex.test(password);
  }
}
