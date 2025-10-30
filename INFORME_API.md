# Informe Técnico - API POV-Review

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Módulos Implementados](#módulos-implementados)
4. [Endpoints de la API](#endpoints-de-la-api)
5. [Autenticación y Autorización](#autenticación-y-autorización)
6. [Persistencia de Datos](#persistencia-de-datos)
7. [Modelos de Datos](#modelos-de-datos)
8. [Pruebas (Testing)](#pruebas-testing)
9. [Características Técnicas](#características-técnicas)

---

## Introducción

**POV-Review** es una API RESTful desarrollada con NestJS que permite a los usuarios registrarse, autenticarse y crear reseñas de películas. La aplicación implementa un sistema robusto de autenticación basado en JWT, control de acceso basado en roles (RBAC), y persistencia de datos con PostgreSQL mediante TypeORM.

### Tecnologías Principales
- **Framework**: NestJS 10.x
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: TypeORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Encriptación**: bcrypt
- **Validación**: class-validator & class-transformer
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

---

## Módulos Implementados

### 1. Auth Module
**Responsabilidad**: Gestión de autenticación y registro de usuarios

**Componentes**:
- `AuthController`: Maneja endpoints de autenticación
- `AuthService`: Lógica de negocio (login, registro, encriptación)
- `JwtStrategy`: Estrategia de validación de tokens JWT
- `UserRoleGuard`: Guard para validar roles de usuario
- Decoradores personalizados: `@Auth()`, `@GetUser()`, `@RoleProtected()`

### 2. Users Module
**Responsabilidad**: Gestión CRUD de usuarios

**Funcionalidades**:
- Creación de usuarios
- Listado paginado (solo ADMIN)
- Consulta de perfil propio
- Búsqueda por ID o email
- Actualización de usuarios
- Actualización de roles (solo ADMIN)

### 3. Movies Module
**Responsabilidad**: Gestión de películas

**Funcionalidades**:
- CRUD completo de películas
- Solo administradores pueden crear, actualizar o eliminar
- Listado público de películas
- Relación OneToMany con Reviews

### 4. Reviews Module
**Responsabilidad**: Gestión de reseñas de películas

**Funcionalidades**:
- Creación de reseñas (usuarios autenticados)
- Listado de todas las reseñas
- Filtrado por película
- Filtrado por usuario
- Actualización y eliminación (solo el autor)
- Relación ManyToOne con User y Movie

### 5. Seed Module
**Responsabilidad**: Inicialización de datos de prueba

**Funcionalidades**:
- Población de base de datos con datos de prueba
- Creación de usuarios, películas y reseñas de ejemplo

---

## Endpoints de la API

### Autenticación (Auth)

#### POST `/auth/register`
**Descripción**: Registra un nuevo usuario en el sistema

**Body**:
```json
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```

**Respuesta** (201):
```json
{
  "id": "uuid",
  "name": "Juan Perez",
  "email": "juan@example.com",
  "roles": ["user"],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notas**:
- La contraseña se encripta con bcrypt (10 rounds)
- Por defecto se asigna el rol `USER`
- Devuelve un token JWT válido por 1 hora

---

#### POST `/auth/login`
**Descripción**: Autentica un usuario existente

**Body**:
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```

**Respuesta** (200):
```json
{
  "id": "uuid",
  "email": "juan@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores**:
- `404`: Usuario no encontrado o credenciales inválidas

---

#### GET `/auth/private`
**Descripción**: Endpoint de prueba para verificar autenticación ADMIN

**Headers**:
```
Authorization: Bearer <token>
```

**Respuesta** (200):
```json
{
  "ok": true,
  "message": "logged in"
}
```

**Protección**: `@Auth(UserRole.ADMIN)` - Solo administradores

---

### Usuarios (Users)

#### POST `/users`
**Descripción**: Crea un nuevo usuario (alternativa a register)

**Body**: Igual que `/auth/register`

**Respuesta** (201): Usuario creado sin token

---

#### GET `/users`
**Descripción**: Lista todos los usuarios con paginación

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit` (opcional): Número de registros por página (default: 10)
- `offset` (opcional): Desplazamiento para paginación (default: 0)

**Ejemplo**: `GET /users?limit=20&offset=0`

**Respuesta** (200):
```json
[
  {
    "id": "uuid",
    "name": "Juan Perez",
    "email": "juan@example.com",
    "roles": ["user"],
    "isActive": true,
    "createdAt": "2025-10-28T10:00:00.000Z",
    "updatedAt": "2025-10-28T10:00:00.000Z"
  }
]
```

**Protección**: `@Auth(UserRole.ADMIN)` - Solo administradores

---

#### GET `/users/profile`
**Descripción**: Obtiene el perfil del usuario autenticado

**Headers**:
```
Authorization: Bearer <token>
```

**Respuesta** (200):
```json
{
  "id": "uuid",
  "name": "Juan Perez",
  "email": "juan@example.com",
  "roles": ["user"],
  "isActive": true,
  "createdAt": "2025-10-28T10:00:00.000Z",
  "updatedAt": "2025-10-28T10:00:00.000Z"
}
```

**Protección**: `@Auth()` - Usuario autenticado

**Nota**: El ID se obtiene automáticamente del token JWT usando el decorador `@GetUser()`

---

#### GET `/users/:term`
**Descripción**: Busca un usuario por UUID o email, incluye sus reviews

**Headers**:
```
Authorization: Bearer <token>
```

**Parámetros**:
- `term`: UUID del usuario o email

**Ejemplo**: 
- `GET /users/123e4567-e89b-12d3-a456-426614174000`
- `GET /users/juan@example.com`

**Respuesta** (200):
```json
{
  "id": "uuid",
  "name": "Juan Perez",
  "email": "juan@example.com",
  "roles": ["user"],
  "reviews": [
    {
      "id": "uuid",
      "name": "Excelente película",
      "rating": 5,
      "comment": "Me encantó",
      "movie": {
        "id": "uuid",
        "title": "The Matrix"
      }
    }
  ]
}
```

**Protección**: `@Auth()` - Usuario autenticado

---

#### PATCH `/users/:id`
**Descripción**: Actualiza los datos de un usuario

**Headers**:
```
Authorization: Bearer <token>
```

**Body** (todos opcionales):
```json
{
  "name": "Juan Pablo Perez",
  "email": "juanp@example.com"
}
```

**Respuesta** (200): Usuario actualizado

**Protección**: `@Auth(UserRole.ADMIN)` - Solo administradores

**Nota**: Usa transacciones de base de datos para garantizar consistencia

---

#### DELETE `/users/:id`
**Descripción**: Elimina un usuario

**Headers**:
```
Authorization: Bearer <token>
```

**Respuesta** (200): Confirmación de eliminación

**Protección**: `@Auth(UserRole.ADMIN)` - Solo administradores

---

#### PATCH `/users/:id/roles`
**Descripción**: Actualiza los roles de un usuario

**Headers**:
```
Authorization: Bearer <token>
```

**Body**:
```json
{
  "roles": ["user", "admin"]
}
```

**Respuesta** (200):
```json
{
  "message": "User roles updated successfully",
  "user": {
    "id": "uuid",
    "name": "Juan Perez",
    "email": "juan@example.com",
    "roles": ["user", "admin"]
  }
}
```

**Protección**: `@Auth(UserRole.ADMIN)` - Solo administradores

---

### Películas (Movies)

#### POST `/movies`
**Descripción**: Crea una nueva película

**Headers**:
```
Authorization: Bearer <token>
```

**Body**:
```json
{
  "title": "The Matrix",
  "description": "A computer hacker learns about the true nature of reality",
  "director": "Lana Wachowski, Lilly Wachowski",
  "releaseDate": "1999-03-31",
  "genre": "sci-fi",
  "duration": 136,
  "rating": 8.7,
  "poster": "https://example.com/poster.jpg"
}
```

**Respuesta** (201): Película creada

**Protección**: `@Auth(UserRole.ADMIN)` - Solo administradores

---

#### GET `/movies`
**Descripción**: Lista todas las películas

**Respuesta** (200):
```json
[
  {
    "id": "uuid",
    "title": "The Matrix",
    "description": "...",
    "director": "Lana Wachowski, Lilly Wachowski",
    "releaseDate": "1999-03-31",
    "genre": "sci-fi",
    "duration": 136,
    "rating": 8.7,
    "poster": "https://example.com/poster.jpg",
    "createdAt": "2025-10-28T10:00:00.000Z",
    "updatedAt": "2025-10-28T10:00:00.000Z"
  }
]
```

**Protección**: Público (sin autenticación)

---

#### GET `/movies/:id`
**Descripción**: Obtiene los detalles de una película específica

**Parámetros**:
- `id`: UUID de la película

**Respuesta** (200): Objeto de película

**Protección**: Público

---

#### PATCH `/movies/:id`
**Descripción**: Actualiza una película

**Headers**:
```
Authorization: Bearer <token>
```

**Body** (todos opcionales): Mismos campos que POST

**Respuesta** (200): Película actualizada

**Protección**: `@Auth(UserRole.ADMIN)` - Solo administradores

---

#### DELETE `/movies/:id`
**Descripción**: Elimina una película

**Headers**:
```
Authorization: Bearer <token>
```

**Respuesta** (200): Confirmación de eliminación

**Protección**: `@Auth(UserRole.ADMIN)` - Solo administradores

**Nota**: Al eliminar una película, se eliminan también sus reviews (CASCADE)

---

### Reseñas (Reviews)

#### POST `/reviews`
**Descripción**: Crea una nueva reseña

**Headers**:
```
Authorization: Bearer <token>
```

**Body**:
```json
{
  "name": "Excelente película",
  "rating": 5,
  "comment": "Una obra maestra del cine",
  "movieId": "uuid-de-la-pelicula"
}
```

**Respuesta** (201):
```json
{
  "id": "uuid",
  "name": "Excelente película",
  "rating": 5,
  "comment": "Una obra maestra del cine",
  "movie": {
    "id": "uuid",
    "title": "The Matrix"
  },
  "user": {
    "id": "uuid",
    "name": "Juan Perez"
  },
  "createdAt": "2025-10-28T10:00:00.000Z",
  "updatedAt": "2025-10-28T10:00:00.000Z"
}
```

**Protección**: `@Auth()` - Usuario autenticado

**Nota**: El usuario se obtiene automáticamente del token con `@GetUser()`

---

#### POST `/reviews/movie/:movieId`
**Descripción**: Crea una reseña para una película específica (ruta alternativa)

**Headers**:
```
Authorization: Bearer <token>
```

**Parámetros**:
- `movieId`: UUID de la película

**Body**:
```json
{
  "name": "Gran película",
  "rating": 4,
  "comment": "Muy entretenida"
}
```

**Respuesta** (201): Igual que POST `/reviews`

**Protección**: `@Auth()` - Usuario autenticado

---

#### GET `/reviews`
**Descripción**: Lista todas las reseñas

**Respuesta** (200):
```json
[
  {
    "id": "uuid",
    "name": "Excelente película",
    "rating": 5,
    "comment": "Una obra maestra",
    "createdAt": "2025-10-28T10:00:00.000Z",
    "updatedAt": "2025-10-28T10:00:00.000Z"
  }
]
```

**Protección**: Público

---

#### GET `/reviews/movie/:movieId`
**Descripción**: Obtiene todas las reseñas de una película específica

**Parámetros**:
- `movieId`: UUID de la película

**Respuesta** (200): Array de reseñas con información del usuario

**Protección**: Público

---

#### GET `/reviews/user/:userId`
**Descripción**: Obtiene todas las reseñas de un usuario específico

**Parámetros**:
- `userId`: UUID del usuario

**Respuesta** (200): Array de reseñas con información de la película

**Protección**: Público

---

#### GET `/reviews/:id`
**Descripción**: Obtiene una reseña específica

**Parámetros**:
- `id`: UUID de la reseña

**Respuesta** (200): Objeto de reseña completo

**Protección**: Público

---

#### PATCH `/reviews/:id`
**Descripción**: Actualiza una reseña

**Headers**:
```
Authorization: Bearer <token>
```

**Body** (todos opcionales):
```json
{
  "name": "Película actualizada",
  "rating": 4,
  "comment": "Comentario actualizado"
}
```

**Respuesta** (200): Reseña actualizada

**Protección**: `@Auth()` - Solo el autor de la reseña puede actualizarla

---

#### DELETE `/reviews/:id`
**Descripción**: Elimina una reseña

**Headers**:
```
Authorization: Bearer <token>
```

**Respuesta** (200): Confirmación de eliminación

**Protección**: `@Auth()` - Solo el autor de la reseña puede eliminarla

---

### Seed

#### GET `/seed`
**Descripción**: Inicializa la base de datos con datos de prueba

**Respuesta** (200):
```json
{
  "message": "Seed executed successfully"
}
```

**Protección**: Público (en producción debería estar protegido)

**Datos creados**:
- Usuarios de prueba (admin y usuarios regulares)
- Películas de ejemplo
- Reseñas de ejemplo

---

## Autenticación y Autorización


#### Componentes de Autenticación

##### 1. JwtStrategy
**Ubicación**: `src/strategies/jwt.strategies.ts`

**Responsabilidad**: Validar y decodificar tokens JWT

**Proceso**:
1. Extrae el token del header `Authorization: Bearer <token>`
2. Verifica la firma con `JWT_SECRET`
3. Extrae el payload (id, email)
4. Busca el usuario en la base de datos
5. Valida que el usuario exista y esté activo
6. Inyecta el usuario en el request

```typescript
async validate(payload: Jwt): Promise<User> {
  const { id } = payload;
  const user = await this.userRepository.findOneBy({ id });
  
  if (!user) throw new UnauthorizedException('Token inválido');
  if (!user.isActive) throw new UnauthorizedException('Usuario inactivo');
  
  return user; // Se inyecta en request.user
}
```

##### 2. AuthService
**Ubicación**: `src/auth/auth.service.ts`

**Funciones principales**:

**Registro** (`create`):
- Valida los datos de entrada
- Encripta la contraseña con bcrypt (10 rounds)
- Asigna rol USER por defecto
- Guarda en la base de datos
- Genera y devuelve un token JWT

**Login** (`login`):
- Busca el usuario por email
- Verifica la contraseña con `bcrypt.compareSync()`
- Genera y devuelve un token JWT

**Generación de Token**:
```typescript
private getJwtToken(payload: Jwt) {
  return this.jwtService.sign(payload);
}
```

**Payload del Token**:
```typescript
{
  id: "uuid-del-usuario",
  email: "usuario@example.com",
  iat: 1234567890,  // Fecha de creación
  exp: 1234571490   // Fecha de expiración (1 hora)
}
```

##### 3. Encriptación de Contraseñas
**Librería**: `bcrypt`

**Configuración**:
- **Rounds**: 10 (balance entre seguridad y rendimiento)
- **Algoritmo**: bcrypt con salt generado automáticamente

```typescript
encryptPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}
```

**Verificación**:
```typescript
bcrypt.compareSync(plainPassword, hashedPassword)
```

---


#### Decoradores de Autorización

##### 1. @Auth()
**Ubicación**: `src/auth/decorators/auth.decorator.ts`

**Propósito**: Decorador compuesto que aplica autenticación y autorización

**Uso**:
```typescript
@Get('profile')
@Auth() // Requiere estar autenticado (cualquier rol)
userProfile(@GetUser() user: User) {
  return this.usersService.userProfile(user.id);
}

@Get()
@Auth(UserRole.ADMIN) // Requiere ser ADMIN
findAll() {
  return this.usersService.findAll();
}
```

**Implementación**:
```typescript
export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    RoleProtected(...roles),              // Define roles permitidos
    UseGuards(AuthGuard(), UserRoleGuard) // Aplica guards
  );
}
```

##### 2. @GetUser()
**Ubicación**: `src/auth/decorators/get-user.decorator.ts`

**Propósito**: Extrae el usuario autenticado del request

**Uso**:
```typescript
@Post()
@Auth()
create(@Body() dto: CreateReviewDto, @GetUser() user: User) {
  // user contiene toda la información del usuario autenticado
}

// También puede extraer un campo específico
@Get()
@Auth()
example(@GetUser('id') userId: string) {
  // Solo obtiene el ID
}
```

##### 3. @RoleProtected()
**Ubicación**: `src/auth/decorators/role-protected/role-protected.decorator.ts`

**Propósito**: Marca qué roles están permitidos (metadata)

**Uso**: Generalmente usado internamente por `@Auth()`

#### Guards de Autorización

##### UserRoleGuard
**Ubicación**: `src/auth/guards/user-role.guard.ts`

**Responsabilidad**: Verificar que el usuario tenga los roles requeridos

**Proceso**:
1. Extrae los roles permitidos de la metadata (`@RoleProtected`)
2. Si no hay roles especificados → Permite acceso
3. Obtiene el usuario del request (inyectado por JwtStrategy)
4. Verifica que el usuario tenga al menos uno de los roles permitidos
5. Lanza `ForbiddenException` si no cumple

```typescript
canActivate(context: ExecutionContext): boolean {
  const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());
  
  if (!validRoles || validRoles.length === 0) return true;
  
  const user = context.switchToHttp().getRequest().user as User;
  
  if (!user) throw new BadRequestException('User not found');
  
  for (const role of user.roles) {
    if (validRoles.includes(role)) return true;
  }
  
  throw new ForbiddenException('User does not have required roles');
}
```

#### Seguridad Adicional

##### Validación de Usuario Activo
Todos los tokens son validados contra el campo `isActive`:
```typescript
if (!user.isActive) throw new UnauthorizedException('Usuario inactivo');
```

##### Protección de Contraseñas
- Nunca se devuelven contraseñas en respuestas
- `delete user.password` antes de enviar datos
- Select explícito en login: `select: { email: true, password: true, id: true }`

##### Variables de Entorno
Token secret almacenado en `.env`:
```
JWT_SECRET=tu-secreto-super-seguro-aqui
```

---

## Persistencia de Datos

### Tecnología: TypeORM + PostgreSQL

La aplicación utiliza **TypeORM** como ORM (Object-Relational Mapping) para interactuar con una base de datos **PostgreSQL**.

#### Configuración de la Base de Datos

**Ubicación**: `src/app.module.ts`

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  autoLoadEntities: true,
  synchronize: true, // Solo en desarrollo
})
```

**Variables de Entorno** (`.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pov_review_db
DB_USERNAME=pov-user
DB_PASSWORD=secure_password
```

#### Docker Compose

La base de datos se ejecuta en un contenedor Docker:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: pov-user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: pov_review_db
    ports:
      - "5432:5432"
    volumes:
      - ./postgres:/var/lib/postgresql/data
```

---

### Entidades

#### 1. User Entity
**Ubicación**: `src/users/entities/user.entity.ts`

**Campos**:
- `id`: UUID (Primary Key, autogenerado)
- `name`: String (nombre completo)
- `email`: String (único, lowercase, validado)
- `password`: String (encriptado con bcrypt, no se devuelve en respuestas)
- `roles`: String[] (array de roles, default: ['user'])
- `isActive`: Boolean (default: true, para soft-delete)
- `createdAt`: Timestamp (autogenerado)
- `updatedAt`: Timestamp (actualizado automáticamente)

**Relaciones**:
- `reviews`: OneToMany con Review (cascade: true)

**Hooks**:
```typescript
@BeforeInsert()
@BeforeUpdate()
checkFieldsBeforeChanges() {
  this.email = this.email.toLowerCase().trim();
}
```

**Características**:
- El email se normaliza automáticamente a lowercase
- Constraint de unicidad en email
- Soft-delete mediante el campo `isActive`

---

#### 2. Movie Entity
**Ubicación**: `src/movies/entities/movie.entity.ts`

**Campos**:
- `id`: UUID (Primary Key)
- `title`: String (título de la película)
- `description`: Text (sinopsis)
- `director`: String (director/es)
- `releaseDate`: Date (fecha de estreno)
- `genre`: String (género)
- `duration`: Integer (duración en minutos)
- `rating`: Float (calificación promedio)
- `poster`: String (URL del poster)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**Relaciones**:
- `reviews`: OneToMany con Review (cascade: true)

**Operaciones CASCADE**:
- Al eliminar una película, se eliminan todas sus reviews

---

#### 3. Review Entity
**Ubicación**: `src/reviews/entities/review.entity.ts`

**Campos**:
- `id`: UUID (Primary Key)
- `name`: String (título de la reseña)
- `rating`: Integer (1-5 estrellas)
- `comment`: Text (comentario detallado)
- `createdAt`: Timestamp (default: CURRENT_TIMESTAMP)
- `updatedAt`: Timestamp (auto-update: CURRENT_TIMESTAMP)

**Relaciones**:
- `user`: ManyToOne con User (onDelete: CASCADE)
- `movie`: ManyToOne con Movie (onDelete: CASCADE)

**Características**:
- Si se elimina un usuario, se eliminan sus reviews
- Si se elimina una película, se eliminan sus reviews
- Timestamps automáticos con `CURRENT_TIMESTAMP`

---

### Repositorios y Servicios

#### Patrón Repository

Cada entidad tiene su repositorio inyectado en el servicio:

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}
}
```

#### Operaciones CRUD Típicas

**Crear**:
```typescript
async create(createDto: CreateDto) {
  const entity = this.repository.create(createDto);
  await this.repository.save(entity);
  return entity;
}
```

**Leer**:
```typescript
// Por ID
findOne(id: string) {
  return this.repository.findOne({
    where: { id },
    relations: ['relatedEntity']
  });
}

// Con Query Builder
findByEmail(email: string) {
  return this.repository
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .leftJoinAndSelect('user.reviews', 'reviews')
    .getOne();
}
```

**Actualizar con Transacciones**:
```typescript
async update(id: string, updateDto: UpdateDto) {
  const entity = await this.repository.preload({
    id,
    ...updateDto
  });
  
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    await queryRunner.manager.save(entity);
    await queryRunner.commitTransaction();
    return entity;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

**Eliminar**:
```typescript
async remove(id: string) {
  const entity = await this.findOne(id);
  return this.repository.remove(entity);
}
```

---

## Pruebas (Testing)

La aplicación implementa una estrategia completa de testing que incluye pruebas unitarias y pruebas end-to-end (e2e) utilizando **Jest** como framework principal y **Supertest** para pruebas HTTP.

### Estrategia de Testing

#### Tipos de Pruebas Implementadas

**1. Pruebas Unitarias (Unit Tests)**
- Ubicación: `src/**/*.spec.ts`
- Framework: Jest
- Objetivo: Verificar el comportamiento aislado de servicios, controladores y guards
- Cobertura: AuthService, UsersService, MoviesService, ReviewsService, Guards

**2. Pruebas de Integración/E2E (End-to-End Tests)**
- Ubicación: `test/*.e2e-spec.ts`
- Framework: Jest + Supertest
- Objetivo: Verificar el flujo completo de las peticiones HTTP
- Cobertura: Endpoints de Auth, Users, Movies, Reviews

### Configuración de Testing

**jest.config.js** (Pruebas Unitarias):
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

**test/jest-e2e.json** (Pruebas E2E):
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### Pruebas Unitarias Implementadas

#### 1. AuthService Tests

**Archivo**: `src/auth/auth.service.spec.ts`

**Casos de prueba**:

**Registro de Usuarios (create)**:
- Debe registrar un nuevo usuario con contraseña encriptada y devolver token
- Debe lanzar `InternalServerErrorException` cuando hay email duplicado (código 23505)

**Login**:
- Debe hacer login con credenciales válidas
- Debe lanzar `NotFoundException` cuando el usuario no existe
- Debe lanzar `NotFoundException` cuando la contraseña es inválida
- Debe retornar token sin el campo password

**Encriptación**:
- Debe hashear la contraseña con bcrypt usando 10 rounds

**Ejemplo de test**:
```typescript
describe('create', () => {
  it('should register a new user with encrypted password and return token', async () => {
    const dto = { email: 'test@test.com', password: 'pass123', fullName: 'Test User' };
    const hashedPassword = 'hashed-pass';
    (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);

    const createdUser = { 
      id: 'u1', 
      email: dto.email, 
      fullName: dto.fullName, 
      password: hashedPassword, 
      roles: ['user'] 
    };
    
    userRepo.create.mockReturnValue(createdUser as any);
    userRepo.save.mockResolvedValue(createdUser as any);

    const result = await service.create(dto);

    expect(result).toHaveProperty('token', 'mock-token');
    expect(result).toHaveProperty('email', dto.email);
    expect(result.password).toBeUndefined();
  });
});
```

**Técnicas utilizadas**:
- Mocking de repositorios con `jest.Mock`
- Mocking de bcrypt para pruebas determinísticas
- Verificación de que las contraseñas no se devuelven en respuestas
- Testing de manejo de errores de base de datos

---

#### 2. UsersService Tests

**Archivo**: `src/users/users.service.spec.ts`

**Casos de prueba**:

**CRUD Básico**:
- `create`: Debe crear y guardar un usuario
- `findAll`: Debe retornar usuarios paginados con diferentes valores de limit/offset
- `findOne`: Debe buscar por UUID o email, lanzar `NotFoundException` si no existe
- `update`: Debe actualizar usuario con transacción, lanzar error si no existe
- `remove`: Debe eliminar usuario existente

**Operaciones Específicas**:
- `findOneWithReviews`: Debe cargar usuario con sus reviews (UUID o email)
- `updateUserRoles`: Debe actualizar roles y sanitizar password
- `userProfile`: Debe retornar perfil del usuario

**Ejemplo de test con transacciones**:
```typescript
describe('update', () => {
  it('should update user with transaction successfully', async () => {
    const dto = { fullName: 'Updated' } as any;
    const user = { id: 'u1', fullName: 'Updated' } as any;
    repo.preload.mockResolvedValue(user);
    
    const queryRunnerMock = dataSource.createQueryRunner();
    (queryRunnerMock.manager.save as jest.Mock).mockResolvedValue(user);

    const result = await service.update('u1', dto);
    
    expect(queryRunnerMock.connect).toHaveBeenCalled();
    expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });
});
```

**Técnicas utilizadas**:
- Mock de QueryRunner para probar transacciones
- Mock de QueryBuilder para búsquedas complejas
- Testing de paginación
- Verificación de sanitización de datos sensibles

---

#### 3. MoviesService Tests

**Archivo**: `src/movies/movies.service.spec.ts`

**Casos de prueba**:

**CRUD Completo**:
- `create`: Debe crear película y parsear la fecha de estreno
- `findAll`: Debe retornar todas las películas
- `findOne`: Debe retornar película por ID, lanzar `NotFoundException` si no existe
- `update`: Debe actualizar película y parsear fecha, lanzar error si no existe
- `remove`: Debe eliminar película existente

**Ejemplo de test con parsing de fechas**:
```typescript
describe('create', () => {
  it('should create and save a movie with parsed releaseDate', async () => {
    const dto = {
      title: 'Matrix',
      description: 'desc',
      director: 'Wachowski',
      genre: 'sci-fi',
      releaseDate: '1999-03-31',
    } as any;

    const created: Partial<Movie> = { 
      id: '1', 
      ...dto, 
      releaseDate: new Date(dto.releaseDate) 
    };

    repo.create.mockReturnValue(created as Movie);
    repo.save.mockResolvedValue(created as Movie);

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalledWith({
      ...dto,
      releaseDate: new Date(dto.releaseDate),
    });
  });
});
```

**Técnicas utilizadas**:
- Testing de transformación de datos (string a Date)
- Verificación de operaciones CRUD completas
- Manejo de errores `NotFoundException`

---

#### 4. ReviewsService Tests

**Archivo**: `src/reviews/reviews.service.spec.ts`

**Casos de prueba**:

**Creación de Reviews**:
- Debe crear review cuando la película existe y el usuario no ha hecho review antes
- Debe lanzar `NotFoundException` cuando la película no existe
- Debe lanzar `BadRequestException` cuando el usuario ya hizo review

**Consultas**:
- `findAll`: Debe retornar reviews y sanitizar campos anidados (password, reviews de movie)
- `findOne`: Debe validar formato UUID, lanzar error si no existe, sanitizar datos
- `getMovieReviews`: Debe retornar reviews de una película específica
- `getUserReviews`: Debe retornar reviews de un usuario específico

**Autorización**:
- `update`: Solo el autor puede actualizar su review
- `remove`: Solo el autor puede eliminar su review
- Debe rechazar actualizaciones/eliminaciones de reviews ajenas

**Ejemplo de test de autorización**:
```typescript
describe('update', () => {
  it('should reject updating others reviews', async () => {
    const id = '2d931510-d99f-494a-8c67-87feb05e1594';
    reviewRepo.findOne.mockResolvedValue({ id, user: { id: 'other' } } as any);
    
    await expect(service.update(id, {} as any, user))
      .rejects.toBeInstanceOf(BadRequestException);
  });
});
```

**Técnicas utilizadas**:
- Mock de múltiples repositorios (Review y Movie)
- Testing de validaciones de negocio (duplicados, permisos)
- Sanitización de datos anidados
- Validación de UUIDs
- Testing de reglas de autorización

---

### Pruebas End-to-End (E2E)

#### 1. Auth E2E Tests

**Archivo**: `test/auth.e2e-spec.ts`

**Casos de prueba**:
- `POST /auth/register`: Debe crear usuario y retornar token
- `POST /auth/login`: Debe autenticar usuario y retornar token
- `GET /auth/private`: Debe retornar 401 sin autenticación

**Ejemplo**:
```typescript
it('/auth/register (POST) should create user', async () => {
  const dto = { email: 'test@test.com', password: 'pass123', fullName: 'Test' };

  await request(app.getHttpServer())
    .post('/auth/register')
    .send(dto)
    .expect(201)
    .expect((res) => {
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe(dto.email);
    });
});
```

---

#### 2. Users E2E Tests

**Archivo**: `test/users.e2e-spec.ts`

**Casos de prueba**:
- `GET /users`: Debe requerir autenticación (401)
- `GET /users/:id`: Debe requerir autenticación (401)

**Objetivo**: Verificar que los endpoints protegidos retornan 401 sin token JWT

---

#### 3. Movies E2E Tests

**Archivo**: `test/movies.e2e-spec.ts`

**Casos de prueba**:
- Verificación de endpoints protegidos
- Testing de CRUD completo de películas
- Validación de permisos de administrador

---

#### 4. Reviews E2E Tests

**Archivo**: `test/reviews.e2e-spec.ts`

**Casos de prueba**:
- Testing de creación de reviews
- Verificación de autorización (solo el autor puede editar/eliminar)
- Consultas públicas vs protegidas

---

### Técnicas de Testing Avanzadas

#### 1. Mocking de Dependencias

**Repositorios**:
```typescript
const repoMock: Partial<Record<keyof Repository<User>, jest.Mock>> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  remove: jest.fn(),
};
```

**Servicios**:
```typescript
const usersServiceMock = {
  findAll: jest.fn().mockResolvedValue([{ id: 'u1', email: 'user@test.com' }]),
  findOne: jest.fn().mockResolvedValue({ id: 'u1', email: 'user@test.com' }),
} as Partial<UsersService>;
```

#### 2. Testing de Transacciones

```typescript
const queryRunnerMock = {
  manager: { save: jest.fn() },
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
};

dataSource = {
  createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
} as any;
```

#### 3. Testing de Query Builders

```typescript
const qb: any = {
  where: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(user),
};
(repo.createQueryBuilder as any).mockReturnValue(qb);
```

#### 4. Sanitización de Datos en Tests

Verificar que campos sensibles no aparezcan en respuestas:
```typescript
expect(result.password).toBeUndefined();
expect(result.user.password).toBeUndefined();
```

### Comandos de Testing

```bash
# Ejecutar todas las pruebas
npm run test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:cov

# Ejecutar pruebas E2E
npm run test:e2e

# Ejecutar pruebas de un archivo específico
npm run test -- auth.service.spec.ts
```

---

## Características Técnicas

### Validación de Datos (DTOs)

La API utiliza **class-validator** y **class-transformer** para validar datos de entrada.

#### Ejemplo: CreateUserDto

```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password debe contener mayúsculas, minúsculas y números'
  })
  password: string;
}
```

#### Ejemplo: PaginationDto

```typescript
export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}
```

**Pipe de Validación Global** (`main.ts`):
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Remueve propiedades no definidas en DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
    transform: true,            // Transforma tipos automáticamente
  })
);
```

---

### Documentación con Swagger

La API está completamente documentada con **Swagger/OpenAPI**.

**Configuración** (`main.ts`):
```typescript
const config = new DocumentBuilder()
  .setTitle('POV-Review API')
  .setDescription('API para gestión de reseñas de películas')
  .setVersion('1.0')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'JWT-auth'
  )
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Acceso**: `http://localhost:3000/api/docs`

**Decoradores usados**:
- `@ApiTags()`: Agrupa endpoints
- `@ApiOperation()`: Describe la operación
- `@ApiResponse()`: Documenta respuestas
- `@ApiParam()`: Documenta parámetros de ruta
- `@ApiQuery()`: Documenta query parameters
- `@ApiBearerAuth()`: Marca endpoints que requieren JWT
- `@ApiProperty()`: Documenta propiedades de entidades/DTOs

---

### Manejo de Errores

#### Excepciones de NestJS
La API utiliza las excepciones estándar de NestJS:

- `NotFoundException` (404): Recurso no encontrado
- `BadRequestException` (400): Datos inválidos
- `UnauthorizedException` (401): Sin autenticación o token inválido
- `ForbiddenException` (403): Sin permisos suficientes
- `InternalServerErrorException` (500): Error del servidor

#### Ejemplo de Manejo
```typescript
private handleException(error) {
  this.logger.error(error);
  
  if (error.code === '23505') {
    throw new InternalServerErrorException(
      'Email already exists'
    );
  }
  
  throw new InternalServerErrorException(
    'Unexpected error occurred'
  );
}
```

---

### Variables de Entorno

**Configuración** (`@nestjs/config`):
```typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env'
})
```

**Variables requeridas** (`.env`):
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pov_review_db
DB_USERNAME=pov-user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=tu-secreto-super-seguro-aqui

# Aplicación
PORT=3000
```

---

### Características de Seguridad

1. **Contraseñas Encriptadas**: bcrypt con 10 rounds
2. **Tokens Firmados**: JWT con secret seguro
3. **Validación Estricta**: DTOs con class-validator
4. **SQL Injection Protection**: Queries parametrizadas de TypeORM
5. **XSS Protection**: Validación y sanitización de entrada
6. **CORS**: Configurado según necesidades
7. **Helmet**: Headers de seguridad HTTP (recomendado añadir)
8. **Rate Limiting**: Pendiente (recomendado añadir)

---

### Testing

La aplicación incluye archivos de testing:
- `*.spec.ts`: Tests unitarios para servicios
- `test/app.e2e-spec.ts`: Tests end-to-end

---

## Conclusiones

### Fortalezas del Sistema

1. **Arquitectura Modular**: Fácil de mantener y escalar
2. **Seguridad Robusta**: JWT + bcrypt + RBAC
3. **Validación Completa**: DTOs con class-validator
4. **Documentación Automática**: Swagger integrado
5. **Tipado Fuerte**: TypeScript en toda la aplicación
6. **Persistencia Confiable**: TypeORM + PostgreSQL + Transacciones
7. **Separación de Responsabilidades**: Controllers, Services, Repositories
8. **Código Limpio**: Decoradores personalizados, Guards reutilizables

### Mejoras Futuras Recomendadas

1. **Rate Limiting**: Prevenir abuso de la API
2. **Helmet**: Headers de seguridad HTTP
3. **Logging Avanzado**: Winston o similar
4. **Tests Completos**: Aumentar cobertura de tests
5. **Caché**: Redis para mejorar rendimiento
6. **Paginación Avanzada**: Cursor-based pagination
7. **Upload de Archivos**: Para posters de películas
8. **Notificaciones**: Sistema de notificaciones en tiempo real
9. **Búsqueda Avanzada**: Full-text search en PostgreSQL
10. **Versionado de API**: `/api/v1/` para futuras versiones

---

## Información del Proyecto

**Desarrolladores**: Equipo POV-Review  
**Framework**: NestJS 10.x  
**Fecha**: Octubre 2025  
**Repositorio**: POV-REVIEW  
**Rama Actual**: Swagger  

---

## Anexos

### Comandos Útiles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Docker
docker-compose up -d       # Iniciar PostgreSQL
docker-compose down        # Detener servicios
docker-compose logs -f     # Ver logs
```

### Estructura de Request Típico

```http
POST /reviews HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "name": "Excelente película",
  "rating": 5,
  "comment": "Me encantó",
  "movieId": "uuid-de-la-pelicula"
}
```

### Códigos de Estado HTTP Usados

- `200 OK`: Operación exitosa (GET, PATCH, DELETE)
- `201 Created`: Recurso creado exitosamente (POST)
- `400 Bad Request`: Datos inválidos o faltantes
- `401 Unauthorized`: Sin autenticación o token inválido
- `403 Forbidden`: Sin permisos para la operación
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

---

**Fin del Informe**