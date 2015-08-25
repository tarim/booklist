'use strict';

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MongoClient = require('mongodb').MongoClient;

var DAO = (function () {
    function DAO() {
        _classCallCheck(this, DAO);
    }

    _createClass(DAO, [{
        key: 'open',
        value: function open() {
            var _this = this;

            var result = MongoClient.connect('mongodb://localhost:27017/mongotest');

            //handling error like this will keep the resulting promise in error state
            result['catch'](function (err) {
                _this.logError('Error connecting ' + err);
            });
            return result;
        }
    }, {
        key: 'confirmSingleResult',
        value: function confirmSingleResult(res) {
            var numInserted = +res.result.n;
            if (!numInserted) {
                throw 'Object not inserted';
            }
            if (numInserted > 1) {
                throw 'Expected 1 object to be inserted.  Actual ' + numInserted;
            }
        }
    }, {
        key: 'logError',
        value: function logError(err) {
            console.log(err);
        }
    }, {
        key: 'logErrorAndReThrow',
        value: function logErrorAndReThrow(err) {
            this.logError(err);
            throw err;
        }
    }, {
        key: 'dispose',
        value: function dispose(db) {
            db.close();
            console.log('DISPOSED');
        }
    }]);

    return DAO;
})();

function dbOperation(target, name, descriptor) {
    var f = descriptor.value;
    descriptor.value = function callee$1$0() {
        var db,
            _len,
            args,
            _key,
            args$2$0 = arguments;

        return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return regeneratorRuntime.awrap(this.open());

                case 2:
                    db = context$2$0.sent;
                    context$2$0.prev = 3;

                    for (_len = args$2$0.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = args$2$0[_key];
                    }

                    context$2$0.next = 7;
                    return regeneratorRuntime.awrap(f.apply(this, [db].concat(args)));

                case 7:
                    context$2$0.prev = 7;

                    this.dispose(db);
                    return context$2$0.finish(7);

                case 10:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[3,, 7, 10]]);
    };
    return descriptor;
}

var BookDAO = (function (_DAO) {
    _inherits(BookDAO, _DAO);

    function BookDAO(userId) {
        _classCallCheck(this, BookDAO);

        _get(Object.getPrototypeOf(BookDAO.prototype), 'constructor', this).call(this);
        this.userId = userId;
    }

    _createDecoratedClass(BookDAO, [{
        key: 'saveBook',
        decorators: [dbOperation],
        value: function saveBook(db, book) {
            var result;
            return regeneratorRuntime.async(function saveBook$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        book.userId = this.userId;
                        context$2$0.next = 3;
                        return regeneratorRuntime.awrap(db.collection('books').insert(book));

                    case 3:
                        result = context$2$0.sent;

                        this.confirmSingleResult(result);

                    case 5:
                    case 'end':
                        return context$2$0.stop();
                }
            }, null, this);
        }
    }]);

    return BookDAO;
})(DAO);

module.exports = BookDAO;