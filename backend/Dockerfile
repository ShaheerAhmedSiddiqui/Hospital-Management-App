FROM node:24

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# Copy only application runtime files; do not copy the entire build context.
COPY index.js ./index.js
COPY config/ ./config/
COPY controller/ ./controller/
COPY middleware/ ./middleware/
COPY models/ ./models/
COPY routes/ ./routes/
COPY utils/ ./utils/

EXPOSE 5000

CMD ["npm", "start"]
