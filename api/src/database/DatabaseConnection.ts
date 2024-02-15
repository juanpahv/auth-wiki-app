import { DataSource, ObjectLiteral, EntityTarget, Repository } from 'typeorm';
import User from '../models/entities/User';
import MailVerificationCode from '../models/entities/MailVerificationCode';

export default class DatabaseConnection {
    private static dataSource?: DataSource; // ? : dataSource puede ser nulo

    public static async getConnectedInstance(): Promise<DataSource>{ // async: se ejecuta en otro hilo 
        if (!DatabaseConnection.dataSource) {
            DatabaseConnection.dataSource = new DataSource({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'root',
                password: 'root',
                database: 'wiki',
                synchronize: true,
                entities: [User, MailVerificationCode]
            });
        }

        if (!DatabaseConnection.dataSource.isInitialized) {
            await DatabaseConnection.dataSource.initialize();
        }

        return DatabaseConnection.dataSource;
    }

    public static async getRepository<Entity extends ObjectLiteral>(
        entityTarget: EntityTarget<Entity>
    ): Promise<Repository<Entity>>{
        const dataSource = await DatabaseConnection.getConnectedInstance(); //
        return dataSource.getRepository(entityTarget);
    }
}
