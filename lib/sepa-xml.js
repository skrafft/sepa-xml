'use strict'

var Handlebars = require('handlebars')
var Big = require('big.js')
var IBAN = require('iban')

const formats = require('./formats')

Handlebars.registerHelper('formatDate', function (dto) {
  return new Handlebars.SafeString(formatDate(dto))
})

Handlebars.registerHelper('timestamp', function () {
  var dto = new Date()
  return new Handlebars.SafeString(dto.toJSON().toString())
})

function formatDate (dto) {
  dto = dto || new Date()

  var month = (dto.getMonth() + 1).toString()
  var day = dto.getDate().toString()

  return dto.getFullYear().toString() + '-' + (month[1] ? month : '0' + month) + '-' + (day[1] ? day : '0' + day)
}

function SepaXML (format) {
  this.outputFormat = format || 'pain.001.001.03'

  this._header = {
    xmlNamespace: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.02',
    xmlSchemaLocation: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.02 pain.001.001.02.xsd',
    messageId: null,
    initiator: null,
    serviceLevel: undefined
  }

  this._payments = {
    payments: []
  }
}

SepaXML.prototype = {

  setHeaderInfo: function (params) {
    for (var p in params) {
      this._header[p] = params[p]
    }
  },

  addPaymentInfo: function (params) {
    const payment = {
      info: {
        id: null,
        method: null,
        batchBooking: false,
        currency: null
      },

      transactions: []
    }
    for (var p in params) {
      payment.info[p] = params[p]
    }
    this._payments.payments.push(payment)
  },

  setPaymentInfo: function (params) {
    this.addPaymentInfo(params)
  },

  compile: function (cb) {
    var _self = this

    this.verifyCurrentInfo(function (err) {
      if (err) return cb(err)
      if (!formats[_self.outputFormat]) return cb(new Error('Non existing format'))

      var template = Handlebars.compile(formats[_self.outputFormat])
      cb(null, template(_self.templateData()))
    })
  },

  templateData: function () {
    var controlSum = Big(0)
    var transactionCount = 0

    for (var i = 0; i < this._payments.payments.length; i++) {
      var paymentTransactionCount = this._payments.payments[i].transactions.length
      var paymentControlSum = Big(0)
      for (var j = 0; j < this._payments.payments[i].transactions.length; j++) {
        paymentControlSum = Big(this._payments.payments[i].transactions[j].amount).plus(paymentControlSum)
      }
      this._payments.payments[i].info.transactionCount = paymentTransactionCount
      this._payments.payments[i].info.transactionControlSum = paymentControlSum.toFixed(2)
      transactionCount += paymentTransactionCount
      controlSum = controlSum.plus(paymentControlSum)
    }

    this._header.transactionCount = transactionCount
    this._header.transactionControlSum = controlSum.toFixed(2)

    return {
      _header: this._header,
      _payments: this._payments
    }
  },

  addTransaction: function (payment) {
    if (!this._payments.payments.length) return 'No payment'
    if (!payment || (!payment.iban && !payment.accountNumber) || !payment.name || !payment.amount || !payment.id) return 'Invalid arguments'
    if (payment.iban && !IBAN.isValid(payment.iban)) return 'Invalid iban'

    this._payments.payments[this._payments.payments.length - 1].transactions.push({
      endToEndId: payment.id,
      amount: payment.amount,
      bic: payment.bic,
      recipientName: payment.name,
      recipientAddress1: payment.address1,
      recipientAddress2: payment.address2,
      recipientIBAN: payment.iban,
      recipientAccountNr: payment.accountNumber,
      paymentDescription: payment.description,
      mandateId: payment.mandateId,
      mandateSignatureDate: payment.mandateSignatureDate,
      debitorName: payment.name,
      debitorIBAN: payment.iban
    })
    return null
  },

  verifyCurrentInfo: function (cb) {
    var errors = []

    for (var p in this._header) {
      if (this._header[p] === null) errors.push('You have not filled in the `' + p + '`.')
    }

    this._payments.payments = this._payments.payments.filter(p => p.transactions.length > 0)
    for (var i = 0; i < this._payments.payments.length; i++) {
      if (this._payments.payments[i].transactions.length === 0) errors.push('The list of transactions is empty  for payment #' + i + '.')
      for (var p in this._payments.payments[i].info) {
        if (this._payments.payments[i].info[p] === null) errors.push('You have not filled in the `' + p + '` for payment #' + i + '.')
      }
    }

    cb((errors.length === 0) ? null : errors)
  }

}

module.exports = SepaXML
