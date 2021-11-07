FROM node:16-alpine3.14 as builder
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
COPY tsconfig.json /usr/src/app/tsconfig.json
COPY src /usr/src/app/src

RUN npm install --quiet && npm run build

FROM node:16-alpine3.14 as runtime
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/build /usr/src/app/build
COPY --from=builder /usr/src/app/package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/package-lock.json /usr/src/app/package-lock.json
RUN npm install --quiet --production

EXPOSE 4000
CMD [ "node", "./build/index.js" ]
