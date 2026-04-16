import { CosmosClient } from '@azure/cosmos';

const {
    AZURE_COSMOS_URI,
    AZURE_COSMOS_KEY,
    AZURE_COSMOS_DB,
    AZURE_COSMOS_CONTAINER,

    ENTE_FISCAL_CODE,
    CITIZEN_FISCAL_CODE,
    NAV
} = process.env;

async function main() {

    const client = new CosmosClient({
        endpoint: AZURE_COSMOS_URI,
        key: AZURE_COSMOS_KEY
    });

    const container = client.database(AZURE_COSMOS_DB)
        .container(AZURE_COSMOS_CONTAINER);

    const item = {
        transactionId: "doc-test-ricevute-999999999-9681-44b4-bb7b-6b0f80a42f2b-0-0",
        eventId: "doc-test-ricevute-999999999-9681-44b4-bb7b-6b0f80a42f2b-0-0",
        subject: "Pagamento Test",
        amount: "25.50",
        payee: {
            name: "CompanyName",
            taxCode: ENTE_FISCAL_CODE
        },
        debtor: {
            name: "Marco Polo",
            taxCode: CITIZEN_FISCAL_CODE
        },
        refNumberValue: NAV,
        refNumberType: "codiceAvviso",
    };
    
    await container.items.create(item);

    console.log(`seed completed!`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});