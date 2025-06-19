# Step 1: Use an official Node.js image as the base image
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json into the container
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the server code into the container
COPY . .

# Step 5.1: Build the TypeScript code
RUN npm run build

# Step 6: Expose the port the app will run on (replace with your actual port)
EXPOSE 8000

# Step 7: Define the command to run the server
CMD ["npm", "start"]
