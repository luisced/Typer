# User Module API Documentation

This module provides user management functionality including authentication, registration, and role-based access control.

## Authentication Endpoints

### Register User
```http
POST /api/v1/users/register
Content-Type: application/json

{
    "email": "user@example.com",
    "username": "username",
    "password": "securepassword",
    "full_name": "Full Name"
}
```

```bash
curl -X POST http://localhost:8000/api/v1/users/register \
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
POST /api/v1/users/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword
# OR
username=username&password=securepassword
```

```bash
# Login with email
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword"

# Login with username
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=username&password=securepassword"
```
- Authenticates user credentials
- Accepts either email or username in the username field
- Returns access and refresh tokens
- Updates last login timestamp

## User Management Endpoints

### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer <access_token>
```

```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```
- Returns the authenticated user's profile
- Requires valid access token

### Update Current User
```http
PUT /api/v1/users/me
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
curl -X PUT http://localhost:8000/api/v1/users/me \
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
DELETE /api/v1/users/me
Authorization: Bearer <access_token>
```

```bash
curl -X DELETE http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```
- Deletes the authenticated user's account
- Cascades deletion to related data (OAuth accounts, profile)

## Role Management Endpoints

### Get User Roles
```http
GET /api/v1/users/me/roles
Authorization: Bearer <access_token>
```

```bash
curl -X GET http://localhost:8000/api/v1/users/me/roles \
  -H "Authorization: Bearer <access_token>"
```
- Returns list of roles assigned to the current user
- Requires valid access token

### Assign Role to Current User
```http
POST /api/v1/users/me/roles/{role_type}
Authorization: Bearer <access_token>
```

```bash
# Assign ADMIN role to current user
curl -X POST http://localhost:8000/api/v1/users/me/roles/admin \
  -H "Authorization: Bearer <access_token>"

# Assign USER role to current user
curl -X POST http://localhost:8000/api/v1/users/me/roles/user \
  -H "Authorization: Bearer <access_token>"
```
- Assigns a role to the current user
- Available roles: `user`, `admin`
- Requires valid access token

### Remove Role from Current User
```http
DELETE /api/v1/users/me/roles/{role_type}
Authorization: Bearer <access_token>
```

```bash
# Remove ADMIN role from current user
curl -X DELETE http://localhost:8000/api/v1/users/me/roles/admin \
  -H "Authorization: Bearer <access_token>"
```
- Removes a role from the current user
- Available roles: `user`, `admin`
- Requires valid access token

### Admin: Assign Role to User
```http
POST /api/v1/users/{user_id}/roles/{role_type}
Authorization: Bearer <access_token>
```

```bash
# Admin assigns ADMIN role to another user
curl -X POST http://localhost:8000/api/v1/users/123e4567-e89b-12d3-a456-426614174000/roles/admin \
  -H "Authorization: Bearer <access_token>"
```
- Assigns a role to any user
- Requires ADMIN role
- Available roles: `user`, `admin`

### Admin: Remove Role from User
```http
DELETE /api/v1/users/{user_id}/roles/{role_type}
Authorization: Bearer <access_token>
```

```bash
# Admin removes ADMIN role from another user
curl -X DELETE http://localhost:8000/api/v1/users/123e4567-e89b-12d3-a456-426614174000/roles/admin \
  -H "Authorization: Bearer <access_token>"
```
- Removes a role from any user
- Requires ADMIN role
- Available roles: `user`, `admin`

## OAuth Integration

The module supports OAuth authentication through multiple providers:
- Google
- GitHub
- Facebook
- Local (email/password)

### OAuth Login Example (Google)
```bash
# First, redirect user to Google OAuth URL
curl -X GET "http://localhost:8000/api/v1/users/oauth/google/login"

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
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "full_name": "Test User"
  }'

# 2. Login with email
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpass123"

# 2b. Or login with username
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123"

# 3. Use the returned access token to get user profile
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"

# 4. Update user profile
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name"
  }'

# 5. Delete user account
curl -X DELETE http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"

# 6. Role Management Examples
# Get current user's roles
curl -X GET http://localhost:8000/api/v1/users/me/roles \
  -H "Authorization: Bearer <access_token>"

# Assign ADMIN role to current user
curl -X POST http://localhost:8000/api/v1/users/me/roles/admin \
  -H "Authorization: Bearer <access_token>"

# Remove ADMIN role from current user
curl -X DELETE http://localhost:8000/api/v1/users/me/roles/admin \
  -H "Authorization: Bearer <access_token>"

# Admin assigns role to another user
curl -X POST http://localhost:8000/api/v1/users/123e4567-e89b-12d3-a456-426614174000/roles/admin \
  -H "Authorization: Bearer <access_token>"
```

## Admin-Only Endpoints

All endpoints below require the ADMIN role (access token for an admin user).

### List Users
```http
GET /api/v1/users
Authorization: Bearer <access_token>
```
- Returns a list of all users.

### Get User by ID
```http
GET /api/v1/users/{user_id}
Authorization: Bearer <access_token>
```
- Returns user details for the given user ID.

### Update User
```http
PUT /api/v1/users/{user_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "email": "newemail@example.com",
    "username": "newusername",
    "full_name": "New Full Name",
    "password": "newpassword"
}
```
- Updates user information for the given user ID.

### Delete User
```http
DELETE /api/v1/users/{user_id}
Authorization: Bearer <access_token>
```
- Deletes the user with the given user ID.

### Ban User
```http
PATCH /api/v1/users/{user_id}/ban
Authorization: Bearer <access_token>
```
- Sets the user's `is_active` to `false` (bans the user).

### Unban User
```http
PATCH /api/v1/users/{user_id}/unban
Authorization: Bearer <access_token>
```
- Sets the user's `is_active` to `true` (unbans the user).

### Site Settings
```http
GET /api/v1/users/settings
Authorization: Bearer <access_token>
```
- Returns the current site settings.

```http
PUT /api/v1/users/settings
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "maintenance_mode": true,
    "registration_open": false
}
```
- Updates site settings.

### Audit Log
```http
GET /api/v1/users/audit-logs
Authorization: Bearer <access_token>
```
- Returns a list of audit log entries (most recent first). 