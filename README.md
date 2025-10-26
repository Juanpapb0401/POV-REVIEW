# POV Review - Aplicación NestJS

API RESTful desarrollada con Nest.js y Postgres que implementa un sistema de gestión de películas y reseñas con autenticación y autorización de usuarios. El proyecto cumple con los requisitos de tener dos módulos interrelacionados:

- **Módulo 1 - Gestión de Películas**: Los usuarios autenticados pueden crear, visualizar, modificar y eliminar sus propias películas.
- **Módulo 2 - Gestión de Reseñas**: Los usuarios pueden crear, visualizar, modificar y eliminar reseñas asociadas a películas específicas.


## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **bun** o **yarn**
- **Docker** y **Docker Compose**
- **Git**

##  Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd pov-review
```

### 2. Instalar Dependencias

```bash
bun install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=pov-user
DB_PASSWORD=pov-password
DB_NAME=pov-review-db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

> **Nota:** El archivo `.env` está en `.gitignore` por seguridad, así que debes crearlo manualmente.

### 4. Levantar la Base de Datos con Docker

```bash
# Levantar PostgreSQL en segundo plano
docker-compose up -d

# Verificar que el contenedor esté corriendo
docker ps
```

### 5. Iniciar la Aplicación

```bash
# Modo desarrollo (con hot reload)
bun run start:dev

## Configuración de Seguridad

- La aplicación usa JWT para autenticación
- Las contraseñas se hashean con bcrypt

##  Notas Adicionales

- La aplicación usa TypeORM con `synchronize: true` para desarrollo
- En producción, usar migraciones en lugar de `synchronize`
- PostgreSQL se ejecuta en Docker para facilitar el desarrollo
- Los datos se persisten en el directorio `postgres/`

