# User Module API Documentation

This module provides user management functionality including authentication, registration, and role-based access control.

## Authentication Endpoints

### Register User
```http
POST /api/v1/user/register
Content-Type: application/json

{
    "email": "user@example.com",
    "username": "username",
    "password": "securepassword",
    "full_name": "Full Name"
}
```

```bash
curl -X POST http://localhost:8000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "securepassword",
    "full_name": "Full Name"
  }'
```
- Creates a new user account
- Automatically assigns the USER role
- Returns user data and authentication tokens

### Login
```http
POST /api/v1/user/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword"
}
```

```bash
curl -X POST http://localhost:8000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```
- Authenticates user credentials
- Returns access and refresh tokens
- Updates last login timestamp

## User Management Endpoints

### Get Current User
```http
GET /api/v1/user/me
Authorization: Bearer <access_token>
```

```bash
curl -X GET http://localhost:8000/api/v1/user/me \
  -H "Authorization: Bearer <access_token>"
```
- Returns the authenticated user's profile
- Requires valid access token

### Update Current User
```http
PUT /api/v1/user/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "email": "newemail@example.com",
    "username": "newusername",
    "full_name": "New Full Name",
    "password": "newpassword"
}
```

```bash
curl -X PUT http://localhost:8000/api/v1/user/me \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "username": "newusername",
    "full_name": "New Full Name",
    "password": "newpassword"
  }'
```
- Updates user profile information
- All fields are optional
- Validates email and username uniqueness

### Delete Current User
```http
DELETE /api/v1/user/me
Authorization: Bearer <access_token>
```

```bash
curl -X DELETE http://localhost:8000/api/v1/user/me \
  -H "Authorization: Bearer <access_token>"
```
- Deletes the authenticated user's account
- Cascades deletion to related data (OAuth accounts, profile)

## OAuth Integration

The module supports OAuth authentication through multiple providers:
- Google
- GitHub
- Facebook
- Local (email/password)

### OAuth Login Example (Google)
```bash
# First, redirect user to Google OAuth URL
curl -X GET "http://localhost:8000/api/v1/user/oauth/google/login"

# After user authorizes, Google will redirect to callback URL with code
# The callback will return access and refresh tokens
```

## Role-Based Access Control

### Available Roles
- `USER`: Default role for regular users
- `ADMIN`: Administrative privileges

### Role Management
Roles are automatically assigned during user creation and can be managed through the service layer:
```python
# Assign role
user_service.assign_role(user_id, RoleType.ADMIN)

# Remove role
user_service.remove_role(user_id, RoleType.ADMIN)

# Check roles
roles = user_service.get_user_roles(user_id)
is_admin = user_service.is_admin(user_id)
```

## Important Notes

1. **Password Security**
   - Passwords are hashed using bcrypt before storage
   - Never store plain text passwords
   - Minimum password length is enforced

2. **Token Management**
   - Access tokens are short-lived (15 minutes by default)
   - Refresh tokens are long-lived (7 days by default)
   - Tokens are JWT-based and contain user ID and role information

3. **Database Relationships**
   - User deletion cascades to related OAuth accounts and profiles
   - Role assignments are managed through a many-to-many relationship

4. **Error Handling**
   - Email and username uniqueness is enforced
   - Invalid credentials return 401 Unauthorized
   - Validation errors return 400 Bad Request
   - Not found errors return 404 Not Found

5. **Security Considerations**
   - All endpoints except register and login require authentication
   - Role-based access control is implemented at the service level
   - OAuth tokens are securely stored and encrypted

6. **Performance**
   - User roles are eagerly loaded with the user object
   - OAuth accounts and profiles are loaded on demand
   - Database indexes are created for frequently queried fields

## Environment Variables

Required environment variables for the user module:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Dependencies

- FastAPI
- SQLAlchemy
- Pydantic
- Python-jose[cryptography]
- Passlib[bcrypt]
- Python-multipart
- Alembic (for migrations)

## Testing the API

You can test the API using curl or any HTTP client. Here's a complete flow example:

```bash
# 1. Register a new user
curl -X POST http://localhost:8000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "full_name": "Test User"
  }'

# 2. Login with the new user
curl -X POST http://localhost:8000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'

# 3. Use the returned access token to get user profile
curl -X GET http://localhost:8000/api/v1/user/me \
  -H "Authorization: Bearer <access_token>"

# 4. Update user profile
curl -X PUT http://localhost:8000/api/v1/user/me \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name"
  }'

# 5. Delete user account
curl -X DELETE http://localhost:8000/api/v1/user/me \
  -H "Authorization: Bearer <access_token>"
``` 