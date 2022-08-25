FROM python:alpine

COPY requirements.txt /app/requirements.txt

RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT [ "python", "app.py" ]
