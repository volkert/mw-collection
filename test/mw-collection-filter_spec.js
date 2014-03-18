(function() {

  'use strict';

  describe('mwCollectionFilter service', function () {

    beforeEach(module('mwCollection'));

    it('should return the correct filter for containsString', inject(function (MwCollectionFilter) {
      var filter = MwCollectionFilter.containsString('category', 'aAuid');

      expect(filter).toEqual({
        type: 'containsString',
        fieldName: 'category',
        contains: 'aAuid'
      });
    }));

    it('should add a logOp filter for and()', inject(function (MwCollectionFilter) {
      var filter = MwCollectionFilter.and([
        MwCollectionFilter.containsString('category', 'auuid'),
        MwCollectionFilter.containsString('name', 'foobar')
      ]);

      expect(filter).toEqual({
        type: 'logOp',
        operation: 'AND',
        filters: [
          {
            type: 'containsString',
            fieldName: 'category',
            contains: 'auuid'
          },
          {
            type: 'containsString',
            fieldName: 'name',
            contains: 'foobar'
          }
        ]
      });
    }));

    it('should add a logOp filter for or()', inject(function (MwCollectionFilter) {
      var filter = MwCollectionFilter.or([
        MwCollectionFilter.containsString('category', 'auuid'),
        MwCollectionFilter.containsString('name', 'foobar')
      ]);

      expect(filter).toEqual({
        type: 'logOp',
        operation: 'OR',
        filters: [
          {
            type: 'containsString',
            fieldName: 'category',
            contains: 'auuid'
          },
          {
            type: 'containsString',
            fieldName: 'name',
            contains: 'foobar'
          }
        ]
      });
    }));


    it('should return the correct filter for nested logOp AND OR', inject(function (MwCollectionFilter) {
      var filter = MwCollectionFilter.or([
        MwCollectionFilter.containsString('name', 'foobar'),
        MwCollectionFilter.and([
          MwCollectionFilter.containsString('category', 'shopping'),
          MwCollectionFilter.containsString('category', 'office')
        ])
      ]);

      expect(filter).toEqual({
        type: 'logOp',
        operation: 'OR',
        filters: [
          {
            type: 'containsString',
            fieldName: 'name',
            contains: 'foobar'
          },
          {
            type: 'logOp',
            operation: 'AND',
            filters: [
              {
                type: 'containsString',
                fieldName: 'category',
                contains: 'shopping'
              },
              {
                type: 'containsString',
                fieldName: 'category',
                contains: 'office'
              }
            ]
          }
        ]
      });
    }));

    it('should return the correct filter for boolean', inject(function (MwCollectionFilter) {
      var filter = MwCollectionFilter.boolean('active', true);

      expect(filter).toEqual({
        type: 'boolean',
        fieldName: 'active',
        value: true
      });
    }));

    it('should return the correct filter for like', inject(function (MwCollectionFilter) {
      var filter = MwCollectionFilter.like('ownership', 'UNKNOWN');

      expect(filter).toEqual({
        type: 'like',
        fieldName: 'ownership',
        like: 'UNKNOWN'
      });
    }));

    it('should return the correct filter for NAND operation', inject(function (MwCollectionFilter) {
      var filter = MwCollectionFilter.nand([
        MwCollectionFilter.containsString('category', 'shopping')
      ]);

      expect(filter).toEqual({
        type: 'logOp',
        operation: 'NAND',
        filters: [
          {
            type: 'containsString',
            fieldName: 'category',
            contains: 'shopping'
          }
        ]
      });
    }));


  });

})();

