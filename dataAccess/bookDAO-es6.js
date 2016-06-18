const ObjectId = require('mongodb').ObjectID;
import DAO from './dao';

const path = require('path');
const fs = require('fs');
const AmazonSearch = require('../amazonDataAccess/AmazonSearch');
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

class BookDAO extends DAO {
    constructor(userId){
        super();
        this.userId = userId;
    }
    async searchBooks({ search, subjects, searchChildSubjects, sort, sortDirection, author, publisher, pages, pagesOperator }){
        subjects = subjects || [];
        let db = await super.open();
        try {
            let query = { userId: this.userId },
                sortObj = { _id: -1 };

            if (search){
                query.title = new RegExp(search, 'gi');
            }
            if (sort){
                sortObj = { [sort]: +sortDirection };
            }
            if (author){
                query.authors = { $in: [new RegExp(author, 'gi')] };
            }
            if (publisher){
                query.publisher = new RegExp(publisher, 'gi');
            }
            if (pages){
                if (pagesOperator == 'gt'){
                    query.pages = { $gt: +pages };
                } else {
                    query.pages = { $lt: +pages };
                }
            }

            if (subjects.length){
                if (searchChildSubjects){
                    let allPaths = subjects.map(s => `,${s},`).join('|');
                    let childIds = (await db.collection('subjects').find({ path: { $regex: allPaths }, userId: this.userId }, { _id: 1 }).toArray()).map(o => '' + o._id);

                    subjects.push(...childIds);
                }

                query.subjects = { $in: subjects };
            }
            //may implement $or another way
            //if (query.title && query.subjects){
            //    query.$or = [
            //        { subjects: query.subjects },
            //        { title: query.title }
            //    ];
            //    delete query.subjects;
            //    delete query.title;
            //}
            return (await db.collection('books').find(query).sort(sortObj).toArray()).map(addCreatedOn);
        } finally {
            super.dispose(db);
        }
    }
    async saveBook(book){
        let db = await super.open();
        try {
            book.userId = this.userId;
            let result = await db.collection('books').insert(book);

            super.confirmSingleResult(result);
        } finally {
            super.dispose(db);
        }
    }
    async saveManual(book){
        let db = await super.open();
        try {
            let bookToInsert = {};
            bookToInsert.userId = this.userId;

            //coming right from the client, so we'll sanitize
            const validProperties = ['title', 'isbn', 'pages', 'publisher', 'publicationDate'];
            validProperties.forEach(prop => bookToInsert[prop] = (book[prop] || '').substr(0, 500));
            bookToInsert.authors = (book.authors || []).filter(a => a).map(a => ('' + a).substr(0, 500));

            if (book.smallImage){
                try {
                    let smallImageSavedToAws = await this.saveToAws(book.smallImage);
                    bookToInsert.smallImage = smallImageSavedToAws;
                } catch(err){
                    //for now just proceed and save the rest of the book
                }
            }

            let result = await db.collection('books').insert(bookToInsert);

            super.confirmSingleResult(result);
        } finally {
            super.dispose(db);
        }
    }
    saveToAws(webPath){
        return new Promise((res, rej) => {
            fs.readFile('.' + webPath, (err, data) => {
                if (err) return rej(err);

                let s3bucket = new AWS.S3({params: {Bucket: 'my-library-cover-uploads'}}),
                    params = {
                        Key: `bookCovers/${this.userId}/${path.basename(webPath)}`,
                        Body: data
                    };

                s3bucket.upload(params, function (err) {
                    if (err) rej(err);
                    else res(`http://my-library-cover-uploads.s3-website-us-east-1.amazonaws.com/${params.Key}`);
                });
            });
        })
    }
    async deleteBook(id){
        let db = await super.open();
        try {
            await db.collection('books').remove({ _id: ObjectId(id) });
        } finally {
            super.dispose(db);
        }
    }
    async update(book){
        let db = await super.open();
        try {

            //coming right from the client, so we'll sanitize
            const validProperties = ['title', 'isbn', 'pages', 'publisher', 'publicationDate'];

            let $set = {};
            validProperties.forEach(prop => $set[prop] = (book[prop] || '').substr(0, 500));
            $set.authors = (book.authors || []).filter(a => a).map(a => ('' + a).substr(0, 500));

            if (book.smallImage){
                try {
                    let smallImageSavedToAws = await this.saveToAws(book.smallImage);
                    $set.smallImage = smallImageSavedToAws;
                } catch(err){
                    //for now just proceed and save the rest of the book
                }
            }

            await db.collection('books').update({ _id: ObjectId(book._id), userId: this.userId }, { $set });
        } finally{
            super.dispose(db);
        }
    }
    async setBooksSubjects(books, add, remove){
        let db = await super.open();
        try{
            await db.collection('books').update(
                { _id: { $in: books.map(_id => ObjectId(_id)) } },
                { $addToSet: { subjects: { $each: (add || []) } } }, { upsert: false, multi: true }
            );

            await db.collection('books').update(
                { _id: { $in: books.map(_id => ObjectId(_id)) } },
                { $pullAll: { subjects: (remove || []) } }, { upsert: false, multi: true }
            );

        } finally {
            super.dispose(db);
        }
    }
}

function addCreatedOn(book){
    book.dateAdded = +book._id.getTimestamp();
    return book;
}

export default BookDAO;