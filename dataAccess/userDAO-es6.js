import DAO from './DAO';
import md5 from 'blueimp-md5';
import salt from '../private/salt';
import { ObjectID } from 'mongodb';

class UserDAO extends DAO {
    async createUser(email, password){
        let db = await super.open();
        try {
            let newUser = { email, password: this.saltAndHashPassword(password) }
            await db.collection('users').insert(newUser);
            return newUser;
        } catch(eee){
            console.log(eee);
        } finally{
            super.dispose(db);
        }
    }
    async lookupUser(email, password){
        let db = await super.open();
        try {
            return await db.collection('users').findOne({ email, password: this.saltAndHashPassword(password) });
        } finally{
            super.dispose(db);
        }
    }
    async lookupUserByToken(token){
        let db = await super.open();
        try {
            return await db.collection('users').findOne({ token });
        } finally{
            super.dispose(db);
        }
    }
    async findById(_id){
        let db = await super.open();
        try {
            return await db.collection('users').findOne({ _id: ObjectID(_id) });
        } finally{
            super.dispose(db);
        }
    }
    saltAndHashPassword(password){
        return md5(`${salt}${password}${salt}`);
    }
}

export default UserDAO;