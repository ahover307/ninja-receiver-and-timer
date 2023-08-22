# Use an official Node.js runtime as the base image for ARM
FROM arm32v7/node:14-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./
COPY yarn.lock ./

# Install app dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Compile the typescript
RUN yarn build

# Expose a port that the application will listen on
EXPOSE 3000

# Command to run your Node.js application
CMD ["node", "./dist/index.js"]
