'use strict';

var SepaXML = require('../index');
var expect = require('chai').expect;

describe('Module loads a new function', function() {
  it('Object `SepaXML` is a function', function() {
    expect(SepaXML).to.be.a('function');
  });
});

describe('Use default format', function () {
  var defaultsepaxml = new SepaXML();

  it('should be `pain.001.001.03` format', function () {
    expect(defaultsepaxml.outputFormat).to.be.equal('pain.001.001.03');
  });
});

describe('Works with the `pain.001.001.03` format', function() {
  var sepaxml = new SepaXML('pain.001.001.03');
  sepaxml.setHeaderInfo({
    messageId: 'ABC123',
    initiator: 'SepaXML'
  });

  sepaxml.setPaymentInfo({
    id: 'XYZ987',
    method: 'TRF',
    currency: 'CHF',
  });

  sepaxml.addTransaction({
    id: 'TRANSAC1',
    iban: 'NL21ABNA0531621583', // fake IBAN from https://www.generateiban.com/test-iban/ thanks
    name: 'generateiban',
    amount: .1
  });

  sepaxml.addTransaction({
    id: 'TRANSAC1',
    iban: 'NL21ABNA0531621583', // fake IBAN from https://www.generateiban.com/test-iban/ thanks
    name: 'generateiban',
    amount: 40.2
  });

  it('Loads the template for the format', function(done) {
    sepaxml.compile(function (err, out) {
      if (err) console.log(err);
      expect(err).to.be.null;
      expect(out).to.be.a('string');

      done();
    });
  });

  it('should autofill BIC', function () {
    expect(sepaxml._payments.payments[0].transactions[0].bic).to.be.eql('ABNANL2A');
  });

  it('should made transaction Control Sum', function () {
    expect(sepaxml._header.transactionCount).to.be.equal(2);
    expect(sepaxml._header.transactionControlSum).to.be.equal('40.30');

    expect(sepaxml._payments.payments[0].info.transactionCount).to.be.equal(2);
    expect(sepaxml._payments.payments[0].info.transactionControlSum).to.be.equal('40.30');
  });

  describe('Validations', function () {
    it('should return validation', function(done) {
      var emptySepa = new SepaXML('pain.001.001.03');

      emptySepa.compile(function (err, out) {
        expect(out).to.be.undefined;
        expect(err).to.be.eql([
          'You have not filled in the `messageId`.',
          'You have not filled in the `initiator`.',
        ]);

        done();
      });
    });

    it('should validate new transaction', function () {
      expect(sepaxml.addTransaction()).to.be.false;
      expect(sepaxml._payments.payments[0].transactions.length).to.be.equal(2);
    });
  });
});
