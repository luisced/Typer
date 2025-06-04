# ─────────────────────────────────────────────────────────────
# Dockerfile para Desarrollo
# ─────────────────────────────────────────────────────────────
FROM python:3.12-slim

# Evitamos archivos .pyc y dejamos logs sin buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

# Instalamos dependencias de sistema necesarias para compilar extensiones nativas
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libpq-dev \
       curl \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el requirements para aprovechar cache de Docker cuando no cambien
COPY requirements.txt .

# Actualizamos pip y instalamos dependencias de Python
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt

# Descargamos los datos de NLTK necesarios
RUN python -c "import nltk; nltk.download('brown'); nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('gutenberg'); nltk.download('cess_esp'); nltk.download('udhr')"

# Copiamos el resto del código (en dev usaremos volumen para sobreescribir)
COPY . .

# Exponemos el puerto donde corre uvicorn
EXPOSE 8000

# Ejecutamos uvicorn en modo desarrollo (reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
