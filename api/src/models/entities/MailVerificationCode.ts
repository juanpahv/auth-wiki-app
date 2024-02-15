import DatabaseConnection from '../../database/DatabaseConnection';
import {Entity, Column, PrimaryColumn, JoinColumn, Repository, OneToMany, ManyToOne} from 'typeorm';
import User from './User';

@Entity({name: 'mailverifactioncode'})
export default class MailVerificationCode {
    
    @PrimaryColumn({type:'int', unsigned: true, nullable: false, unique: true})
    public id: number;
    
    @Column({type:'datetime', nullable: false})
    public creationDateTime: Date;
    
    @ManyToOne(()=>User,(user)=>user.mailVerificationCodes)
    user: User;
    
    private constructor(_id: number,_user: User){
        this.id = _id;
        this.user = _user;
        this.creationDateTime = new Date();
    }
    public static async getMailVerificationCodeRepository(): Promise<Repository<MailVerificationCode>> {
        const databaseConnection = await DatabaseConnection.getConnectedInstance();
        return databaseConnection.getRepository(MailVerificationCode);
    }

    public static async createMailVerificationCode (_user: User): Promise<MailVerificationCode>{
        const repositoryMailVerificationCode = await MailVerificationCode.getMailVerificationCodeRepository();
        const provitionalId = Math.floor(Math.random()*(999999+1));
        let existingMailVerificationCode = await repositoryMailVerificationCode.findOneBy({id:provitionalId})

        if(!existingMailVerificationCode){
            existingMailVerificationCode = new MailVerificationCode(
                provitionalId,
                _user
            )
        }else{
            existingMailVerificationCode.user = _user;
            existingMailVerificationCode.creationDateTime = new Date();
        }
        return existingMailVerificationCode;
    }
}