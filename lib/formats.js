module.exports = {
  'pain.001.001.03': `<?xml version="1.0" encoding="UTF-8"?>
  <Document xmlns="{{_header.xmlNamespace}}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="{{_header.xmlSchemaLocation}}">
    <CstmrCdtTrfInitn>
      <GrpHdr>
        <MsgId>{{_header.messageId}}</MsgId>
        <CreDtTm>{{timestamp}}</CreDtTm>
        <NbOfTxs>{{_header.transactionCount}}</NbOfTxs>
        <CtrlSum>{{_header.transactionControlSum}}</CtrlSum>
        <InitgPty>
          <Nm>{{_header.initiator}}</Nm>
          {{#if _header.initiatorId}}
            <Id>
              <PrvtId>
                <Othr>
                  <Id>{{_header.initiatorId}}</Id>
                </Othr>
              </PrvtId>
            </Id>
          {{/if}}
        </InitgPty>
      </GrpHdr>
      {{#each _payments.payments}}
      <PmtInf>
        <PmtInfId>{{info.id}}</PmtInfId>
        <PmtMtd>{{info.method}}</PmtMtd>
        <BtchBookg>{{info.batchBooking}}</BtchBookg>
        <NbOfTxs>{{info.transactionCount}}</NbOfTxs>
        <CtrlSum>{{info.transactionControlSum}}</CtrlSum>
        {{#if info.serviceLevel}}
        <PmtTpInf>
          <SvcLvl>
            <Cd>{{info.serviceLevel}}</Cd>
          </SvcLvl>
        </PmtTpInf>
        {{/if}}
        {{#if info.localInstrument}}
        <PmtTpInf> 
          <LclInstrm>
            <Prtry>{{info.localInstrument}}</Prtry>
          </LclInstrm>
        </PmtTpInf>
        {{/if}}
        <ReqdExctnDt>{{formatDate info.when}}</ReqdExctnDt>
        <Dbtr>
          <Nm>{{info.senderName}}</Nm>
        </Dbtr>
        <DbtrAcct>
          <Id>
            <IBAN>{{info.senderIBAN}}</IBAN>
          </Id>
        </DbtrAcct>
        {{#if info.bic}}
        <DbtrAgt>
          <FinInstnId>
            <BIC>{{info.bic}}</BIC>
          </FinInstnId>
        </DbtrAgt>
        {{/if}}
        {{#each transactions}}
        <CdtTrfTxInf>
          <PmtId>
            <InstrId>{{endToEndId}}</InstrId>
            <EndToEndId>{{endToEndId}}</EndToEndId>
          </PmtId>
          <Amt>
            <InstdAmt Ccy="{{../info.currency}}">{{amount}}</InstdAmt>
          </Amt>
          {{#if bic}}
          <CdtrAgt>
            <FinInstnId>
              <BIC>{{bic}}</BIC>
            </FinInstnId>
          </CdtrAgt>
          {{/if}}
          <Cdtr>
            <Nm>{{recipientName}}</Nm>
            {{#if address1 && address2}}
            <PstlAdr>
              <AdrLine>{{address1}}</AdrLine>
              <AdrLine>{{address2}}</AdrLine>
            </PstlAdr>
            {{/if}}
          </Cdtr>
          <CdtrAcct>
            <Id>
              {{#if recipientIBAN}}
              <IBAN>{{recipientIBAN}}</IBAN>
              {{else}} 
              {{#if recipientAccountNr}}
              <Othr>
                <Id>{{recipientAccountNr}}</Id>
              </Othr>
              {{/if}}
              {{/if}}
            </Id>
          </CdtrAcct>
          <RmtInf>
            {{#if ../info.localInstrument}}
            <Strd>
              <CdtrRefInf>
                <Ref>{{paymentDescription}}</Ref>
              </CdtrRefInf>
            </Strd>
            {{else}}
              <Ustrd>{{paymentDescription}}</Ustrd>
            {{/if}}
          </RmtInf>
        </CdtTrfTxInf>
        {{/each}}
      </PmtInf>
      {{/each}}
    </CstmrCdtTrfInitn>
  </Document>
  `,
  'pain.008.001.02': `<?xml version="1.0" encoding="utf-8"?>
  <Document xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xsi:schemaLocation="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02 pain.008.001.02.xsd"  xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02">
    <CstmrDrctDbtInitn>
      <GrpHdr>
        <MsgId>{{_header.messageId}}</MsgId>
        <CreDtTm>{{timestamp}}</CreDtTm>
        <NbOfTxs>{{_header.transactionCount}}</NbOfTxs>
        <CtrlSum>{{_header.transactionControlSum}}</CtrlSum>
        <InitgPty>
          <Nm>{{_header.initiator}}</Nm>
        </InitgPty>
      </GrpHdr>
      <PmtInf>
        <PmtInfId>{{_payments.info.id}}</PmtInfId>
        <PmtMtd>{{_payments.info.method}}</PmtMtd>
        <BtchBookg>{{_payments.info.batchBooking}}</BtchBookg>
        <NbOfTxs>{{_payments.info.transactionCount}}</NbOfTxs>
        <CtrlSum>{{_payments.info.transactionControlSum}}</CtrlSum>
        <PmtTpInf>
          <SvcLvl>
            <Cd>SEPA</Cd>
          </SvcLvl>
          <LclInstrm>
            <Cd>CORE</Cd>
          </LclInstrm>
          <SeqTp>RCUR</SeqTp>
        </PmtTpInf>
        <ReqdColltnDt>{{formatDate _payments.info.when}}</ReqdColltnDt>
        <Cdtr>
          <Nm>{{_payments.info.creditorName}}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <IBAN>{{_payments.info.creditorIBAN}}</IBAN>
          </Id>
        </CdtrAcct>
        <CdtrAgt>
          <FinInstnId>
            <BIC>{{_payments.info.bic}}</BIC>
          </FinInstnId>
        </CdtrAgt>
        <ChrgBr>SLEV</ChrgBr>
        <CdtrSchmeId>
          <Id>
            <PrvtId>
              <Othr>
                <Id>{{_payments.info.creditorIdentifier}}</Id>
                <SchmeNm>
                  <Prtry>SEPA</Prtry>
                </SchmeNm>
              </Othr>
            </PrvtId>
          </Id>
        </CdtrSchmeId>
        {{#each _payments.transactions}}
        <DrctDbtTxInf>
          <PmtId>
              <EndToEndId>{{endToEndId}}</EndToEndId>
          </PmtId>
          <InstdAmt Ccy="EUR">{{amount}}</InstdAmt>
          <DrctDbtTx>
            <MndtRltdInf>
              <MndtId>{{mandateId}}</MndtId>
              <DtOfSgntr>{{mandateSignatureDate}}</DtOfSgntr>
              <AmdmntInd>false</AmdmntInd>
            </MndtRltdInf>
          </DrctDbtTx>
          {{#if bic}}
          <DbtrAgt>
              <FinInstnId>
                <BIC>{{bic}}</BIC>
              </FinInstnId>
          </DbtrAgt>
          {{/if}}
          <Dbtr>
            <Nm>{{debitorName}}</Nm>
          </Dbtr>
          <DbtrAcct>
            <Id>
              <IBAN>{{debitorIBAN}}</IBAN>
            </Id>
          </DbtrAcct>
          <RmtInf>
            <Ustrd>{{paymentDescription}}</Ustrd>
          </RmtInf>
        </DrctDbtTxInf>
        {{/each}}
      </PmtInf>
    </CstmrDrctDbtInitn>
  </Document>`
}
