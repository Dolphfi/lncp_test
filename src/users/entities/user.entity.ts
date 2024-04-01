import { UserRoles } from "src/utility/common/user-roles.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ nullable: false })
    first_name: string;
    @Column({ nullable: false })
    last_name: string;
    @Column({ unique: true, nullable: false })
    email: string;
    @Column({ unique: true, nullable: false })
    username: string;
    @Column({ nullable: false, select: false })
    password: string;
    @Column({type: 'enum', enum: UserRoles, default:[UserRoles.STUDENT]})
    roles: UserRoles[];
    @Column({nullable: false, default: 1 })
    isActive: boolean;
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
