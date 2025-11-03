# Use Node.js base image
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend code and build
COPY . .
RUN npm run build

# Serve static files using a lightweight web server
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose frontend port
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
