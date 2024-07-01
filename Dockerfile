# Use an official Node.js runtime as a parent image
FROM node:22-alpine3.20

# Set the working directory in the container
WORKDIR /usr/src/app

# Create a non-root user and group
RUN addgroup -S bulletinboard && adduser -S -G bulletinboard bulletinboard

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create data directory and default files
RUN mkdir -p /usr/src/app/data && \
    echo "[]" > /usr/src/app/data/announcements.json && \
    echo '{"admin": "password123"}' > /usr/src/app/data/users.json

# Change ownership of the working directory
RUN chown -R bulletinboard:bulletinboard /usr/src/app

# Switch to the non-root user
USER bulletinboard

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the app
CMD ["node", "server.js"]
