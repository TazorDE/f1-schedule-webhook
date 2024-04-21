FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# copy code to the container
COPY . .

# Start app
CMD ["node", "index.js"]
