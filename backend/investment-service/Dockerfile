# --- ETAPA 1: BUILD (Compilación) ---
# Usamos una imagen que ya tiene Maven y Java
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copiamos el pom.xml y descargamos dependencias (Caché de capas)
COPY pom.xml .
# Esto descarga las librerías sin copiar el código fuente aún (optimización)
RUN mvn dependency:go-offline

# Copiamos el código fuente y compilamos
COPY src ./src
RUN mvn clean package -DskipTests

# --- ETAPA 2: RUNTIME (Ejecución) ---
# Usamos una imagen ligera solo con JRE (Java Runtime) para que pese poco
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiamos SOLO el JAR generado en la etapa anterior
# Fíjate que --from=build hace referencia a la etapa 1
COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
