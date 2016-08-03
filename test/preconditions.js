'use strict';

let request = require("supertest");

require('should');

describe('Precondition', () => {

    var server, resourceUrl, resourceEtag;

    beforeEach(function (done) {
        server = require('./server')();
        request(server)
            .post('/something')
            .send("cruft")
            .expect(201)
            .expect(function (res) {
                resourceUrl = res.header['location'];
                resourceEtag = res.header['etag'];
            })
            .end(done);
    });


    describe('if-range', () => {

        it('should return 501 not implemented', done => {
            request(server)
                .get('/x')
                .set('if-range', '"1"')
                .expect(501)
                .end(done);
        });

    });

    describe('if-none-match', () => {

        it('should succeed when etag does not exist', done => {
            request(server)
                .put(resourceUrl)
                .set('if-none-match', '"x"')
                .expect(200)
                .end(done);
        });

       it('should succeed when none of etags exist', done => {
            request(server)
                .put(resourceUrl)
                .set('if-none-match', ['"x"', '"y"', '"z"'])
                .expect(200)
                .end(done);
        });

       it('should succeed when no etag exists', done => {
            request(server)
                .post('/something-else')
                .set('if-none-match', '*')
                .expect(201)
                .end(done);
        });

        it('should fail when etag exists', done => {
            request(server)
                .put(resourceUrl)
                .set('if-none-match', resourceEtag)
                .expect(412)
                .end(done);
        });

       it('should fail when one of the etags exists', done => {
            request(server)
                .put(resourceUrl)
                .set('if-none-match', ['"x"', '"y"', '"z"', resourceEtag])
                .expect(412)
                .end(done);
        });

       it('should fail when any etag exists', done => {
            request(server)
                .put(resourceUrl)
                .set('if-none-match', '*')
                .expect(412)
                .end(done);
        });

        it('should return 304 when method is GET and etag exists', done => {
            request(server)
                .get(resourceUrl)
                .set('if-none-match', resourceEtag)
                .expect(304)
                .end(done);
        });

        it('should return 304 when method is HEAD and etag exists', done => {
            request(server)
                .head(resourceUrl)
                .set('if-none-match', resourceEtag)
                .expect(304)
                .end(done);
        });

    });

});