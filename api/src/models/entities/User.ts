import DatabaseConnection from '../../database/DatabaseConnection';
import {Entity, Column, PrimaryGeneratedColumn, Repository, ManyToOne, OneToMany} from 'typeorm';
import MailVerificationCode from './MailVerificationCode';

@Entity({name: 'user'})
export default class User {

    @PrimaryGeneratedColumn({type:'int', unsigned: true})
    public id: number;

    @Column({type:'varchar', length:32, nullable: false, unique: true})
    public username: string;
    
    @Column({type:'varchar', length:32, nullable: false})
    public password: string;

    @Column({type:'varchar', length:64, nullable: false, unique: true})
    public mail: string;

    @Column({type:'datetime', nullable: false})
    public creationDateTime: Date;

    @Column({type:'datetime', nullable:false})
    public updateDateTime: Date;

    @Column({type: 'boolean', nullable: false, default:false})
    public isVerified: boolean;

    @OneToMany(()=>MailVerificationCode,(mailVerificationCode)=>mailVerificationCode.user)
    mailVerificationCodes: MailVerificationCode[];

    public constructor(_username: string, _password: string, _mail: string){
        this.username = _username;
        this.password = _password;
        this.mail = _mail;
        this.creationDateTime = new Date();
        this.updateDateTime = new Date();
    }
    public static async getRepositoryUser(): Promise<Repository<User>> {
        const databaseConnection = await DatabaseConnection.getConnectedInstance();
        return databaseConnection.getRepository(User);
    }
    
    public static async buscarPorNombreUsuarioYPassword(
        username: string,
        password: string
    ): Promise<User> {
        const repositorioUsuarios = await this.getRepositoryUser();

        const usuario = await repositorioUsuarios.findOneBy({ password, username });

        if (!usuario) {
            throw new Error('ErrorUsuarioNoEncontrado');
        }

        return usuario;
    }
    
}