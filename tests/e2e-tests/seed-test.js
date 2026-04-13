conn = new Mongo();
db = conn.getDB("db");

db.getCollection('biz-events-view-cart').insertMany([
{
    "id": "doc-test-ricevute-999999999-9681-44b4-bb7b-6b0f80a42f2b-0-0",
    "transactionId": "doc-test-ricevute-999999999-9681-44b4-bb7b-6b0f80a42f2b-0-0",
    "eventId": "doc-test-ricevute-999999999-9681-44b4-bb7b-6b0f80a42f2b-0-0",
    "subject": "Pagamento Test",
    "amount": "25.50",
    "payee": {
        "name": "CompanyName",
        "taxCode": "00493410583"
    },
    "debtor": {
        "name": "Marco Polo",
        "taxCode": "PLOMRC55M30H999K"
    },
    "refNumberValue": "39912121212121212",
    "refNumberType": "codiceAvviso",
    "_rid": "sMJGANgrgKu-AQEAAAAAAA==",
    "_self": "dbs/sMJGAA==/colls/sMJGANgrgKs=/docs/sMJGANgrgKu-AQEAAAAAAA==/",
    "_etag": "\"9c0275e3-0000-0d00-0000-69d9093b0000\"",
    "_attachments": "attachments/",
    "_ts": 1775831355
}]);