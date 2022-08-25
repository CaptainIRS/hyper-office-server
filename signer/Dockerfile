FROM python:alpine

RUN apk add --no-cache gcc g++

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT [ "python", "app.py" ]
