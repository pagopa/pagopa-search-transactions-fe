import { CosmosClient } from '@azure/cosmos';

const {
  AZURE_COSMOS_URI,
  AZURE_COSMOS_KEY,
  AZURE_COSMOS_DB,
  AZURE_COSMOS_CONTAINER,
  NAV
} = process.env;

async function main() {
  const client = new CosmosClient({
    endpoint: AZURE_COSMOS_URI,
    key: AZURE_COSMOS_KEY
  });

  const container = client
    .database(AZURE_COSMOS_DB)
    .container(AZURE_COSMOS_CONTAINER);

  const querySpec = {
    query: 'SELECT * FROM c WHERE c.refNumberValue = @nav',
    parameters: [{ name: '@nav', value: NAV }]
  };

  const { resources } = await container.items.query(querySpec).fetchAll();
  console.log(`${resources.length} items found!`);

  for (const item of resources) {
    console.log('Deleting item:', { id: item.id });
    await container.item(item.id, item.transactionId).delete();
  }

  console.log('cleanup completed!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});