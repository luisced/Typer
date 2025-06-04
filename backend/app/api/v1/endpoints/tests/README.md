# User Test History API Documentation

This module provides endpoints for saving and retrieving user typing test history, including per-character statistics.

## Endpoints

### Create a Test (Save Stats)

**POST** `/api/v1/tests/me/tests`

**Headers:**
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**Request Body Example:**
```json
{
  "wpm": 95.2,
  "accuracy": 98.5,
  "test_type": "words+punctuation",
  "duration": 60,
  "char_logs": [
    { "char": "a", "attempts": 10, "errors": 2, "total_time": 3000 },
    { "char": ",", "attempts": 5, "errors": 1, "total_time": 1800 }
  ],
  "timestamp": "2024-06-01T12:00:00Z"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:8000/api/v1/tests/me/tests \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "wpm": 95.2,
    "accuracy": 98.5,
    "test_type": "words+punctuation",
    "duration": 60,
    "char_logs": [
      { "char": "a", "attempts": 10, "errors": 2, "total_time": 3000 },
      { "char": ",", "attempts": 5, "errors": 1, "total_time": 1800 }
    ],
    "timestamp": "2024-06-01T12:00:00Z"
  }'
```

---

### Get All Tests for Current User

**GET** `/api/v1/tests/me/tests`

**Headers:**
- `Authorization: Bearer <access_token>`

**Curl Example:**
```bash
curl -X GET http://localhost:8000/api/v1/tests/me/tests \
  -H "Authorization: Bearer <access_token>"
```

---

## Response Example (GET)
```json
[
  {
    "id": "...",
    "user_id": "...",
    "wpm": 95.2,
    "accuracy": 98.5,
    "test_type": "words+punctuation",
    "duration": 60,
    "timestamp": "2024-06-01T12:00:00Z",
    "char_logs": [
      { "id": "...", "test_id": "...", "char": "a", "attempts": 10, "errors": 2, "total_time": 3000 },
      { "id": "...", "test_id": "...", "char": ",", "attempts": 5, "errors": 1, "total_time": 1800 }
    ]
  }
]
``` 