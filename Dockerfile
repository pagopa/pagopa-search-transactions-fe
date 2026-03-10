# Build Stage to fix sha
FROM node:24.13.1-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03 AS build
WORKDIR /app

ARG NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL
ARG NEXT_PUBLIC_CIE_SEARCH_API_BASE_PATH

ENV NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL=$NEXT_PUBLIC_CIE_SEARCH_API_BASE_URL
ENV NEXT_PUBLIC_CIE_SEARCH_API_BASE_PATH=$NEXT_PUBLIC_CIE_SEARCH_API_BASE_PATH

COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Production Stage to fix sha
FROM node:24.13.1-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03 AS production
WORKDIR /app

RUN yarn global add serve
COPY --from=build /app/out ./out

EXPOSE 3000

CMD ["serve", "-s", "out", "-l", "3000"]