# ETAPA 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Empaquetamos saltando tests para agilizar el build inicial
RUN mvn clean package -DskipTests

# ETAPA 2: Runtime (Imagen final)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copiamos solo el JAR compilado desde la etapa 1
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
