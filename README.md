# PagoPA Search Transactions FE

A Next.js frontend application used to retrieve and display the details of a pagoPA payment notice starting from:

- creditor organization fiscal code
- debtor / citizen fiscal code
- notice number (NAV)
- application token

## Overview

This frontend reads the input parameters from the URL fragment, validates them, invokes the backend API, and renders either:

- the payment notice details, when the lookup is successful
- a full-page error state with localized Italian messages, when the backend returns an error

The project also includes a local mock server to simulate both successful and failing API responses defined in the OpenAPI contract.

## Requirements

- Node.js
- Yarn or npm

## Run locally

### 1. Start the mock backend

```bash
yarn mock-server
```
The mock server is exposed at:

```
http://localhost:8080
```

### 1. Start the frontend
env
```
NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CIE_SEARCH_API_BASE_PATH=/searchtransactions/v1
```
```bash
yarn dev
```
The frontend will be available at:
```
http://localhost:3000
```


## URL fragment format
The recommended fragment format is named, not positional.

Example:
```
#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=39912121212121212&token=mock-valid-token
```

### Supported parameters
| Parameter     | Description                                           | Required               |
| ------------- | ----------------------------------------------------- | ---------------------- |
| `cfEnte`      | Creditor organization fiscal code                     | yes                    |
| `cfCittadino` | Debtor / citizen fiscal code                          | yes                    |
| `nav`         | Notice number / NAV                                   | yes                    |
| `token`       | Application token forwarded to the backend as `token` | yes for mock scenarios |
| `requestType` | Optional request type                                 | no                     |


#### Notes
- Legacy positional fragment parsing may still be supported for backward compatibility.
- The preferred format for documentation, testing, and manual usage is the named fragment format shown above.

## Mock authentication behavior

The mock backend accepts exactly one valid token:
```
mock-valid-token
```
If the token header is missing or different from the expected value, the mock returns:
```
401 Unauthorized
```

This means:
- 401 is triggered by an invalid token
- all other mock error scenarios are triggered with a valid token and a specific nav

## Reference mock data
Use the following values for all examples below:
- `cfEnte = 00493410583`
- `cfCittadino = RSSMRA80A01H501U`
- `token = mock-valid-token`


## Mock scenarios
| Scenario                  | Fragment                                                                                        | Expected behavior                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 200 OK                    | `#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=39912121212121212&token=mock-valid-token` | Payment details are displayed                                           |
| 400 Bad Request           | `#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=40012121212121212&token=mock-valid-token` | Error screen with localized Italian message and error code `GN_400_003` |
| 401 Unauthorized          | `#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=39912121212121212&token=wrong-token`      | Authorization error screen                                              |
| 403 Forbidden             | `#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=40312121212121212&token=mock-valid-token` | Error screen with localized Italian message                             |
| 404 Not Found             | `#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=40412121212121212&token=mock-valid-token` | Error screen with localized Italian message and error code `BZ_404_004` |
| 429 Too Many Requests     | `#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=42912121212121212&token=mock-valid-token` | Error screen for rate limiting                                          |
| 500 Internal Server Error | `#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=50012121212121212&token=mock-valid-token` | Error screen with localized Italian message and error code `UN_500_000` |


Ready-to-use local URLs

| Scenario                  | URL                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 200 OK                    | `http://localhost:3000/#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=39912121212121212&token=mock-valid-token` |
| 400 Bad Request           | `http://localhost:3000/#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=40012121212121212&token=mock-valid-token` |
| 401 Unauthorized          | `http://localhost:3000/#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=39912121212121212&token=wrong-token`      |
| 403 Forbidden             | `http://localhost:3000/#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=40312121212121212&token=mock-valid-token` |
| 404 Not Found             | `http://localhost:3000/#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=40412121212121212&token=mock-valid-token` |
| 429 Too Many Requests     | `http://localhost:3000/#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=42912121212121212&token=mock-valid-token` |
| 500 Internal Server Error | `http://localhost:3000/#cfEnte=00493410583&cfCittadino=RSSMRA80A01H501U&nav=50012121212121212&token=mock-valid-token` |


# Testing

Run the test suite:
```bash
yarn test
```
Run tests with coverage:
```bash
yarn test:coverage
```


## End-2-End tests

For run e2e tests in dev, from your pc, remember to edit `SEARCH_TRANSACTIONS_TOKEN` in `tests/e2e-tests/dev.env`
Then you can run
```bash
yarn e2e-tests-dev
```

For run e2e tests in uat, from your pc, remember to edit `SEARCH_TRANSACTIONS_TOKEN` in `tests/e2e-tests/uat.env`
Then you can run
```bash
yarn e2e-tests-uat
```

## Test Playwright with ui
In `playwright.config.ts` enable
```bash
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, 'tests/integration-tests/local.env') });
```
change .env path with env for test:
- `tests/integration-tests/local.env` for integration tests
- `tests/e2e-tests/dev.env` for dev e2e-tests
- `tests/e2e-tests/uat.env` for uat e2e-tests

then run:
- for integration tests
    ```bash
    yarn playwright-integration-ui
    ```
- for e2d tests
    ```bash
    yarn playwright-e2e-ui
    ```

- N.B. 
  All tests must have a NAV code prefix starting with '399' for the policy APIM due to the APIM policy blocking other NAVs.