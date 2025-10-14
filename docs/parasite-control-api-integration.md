# Parasite Control API Integration

This document describes the complete API integration for the Parasite Control system with the real API endpoints at `https://barns-g2ou.vercel.app/parasite-control/`.

## API Endpoints

### Base URL
```
https://barns-g2ou.vercel.app/parasite-control/
```

### Supported Operations

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/parasite-control/` | Get all records with pagination | `page`, `limit`, `search`, `filter` |
| GET | `/parasite-control/{id}` | Get single record by ID | `id` |
| POST | `/parasite-control/` | Create new record | Record data |
| PUT | `/parasite-control/{id}` | Update entire record | `id`, Record data |
| PATCH | `/parasite-control/{id}` | Partial update of record | `id`, Partial data |
| DELETE | `/parasite-control/{id}` | Delete record | `id` |
| POST | `/parasite-control/export/csv` | Export records to CSV | `ids` (optional) |

## Implementation Details

### 1. Base API Configuration (`lib/api/base-api.ts`)

```typescript
const API_BASE_URL = 'https://barns-g2ou.vercel.app/';
```

- **Timeout**: 30 seconds for regular requests
- **Headers**: JSON content type and accept headers
- **Authentication**: Bearer token from auth store
- **Error Handling**: Automatic logout on 401 errors

### 2. Parasite Control API (`lib/api/parasite-control.ts`)

#### Features:
- **Fallback Mechanism**: Falls back to mock data if API fails
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Timeout Configuration**: 15 seconds for CRUD operations, 30 seconds for exports
- **Type Safety**: Full TypeScript support with proper typing

#### Methods:

##### `getList(params?)`
- **Purpose**: Get paginated list of records
- **Parameters**: 
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 30)
  - `search`: Search term
  - `filter`: Filter object
- **Returns**: `PaginatedResponse<ParasiteControl>`

##### `getById(id)`
- **Purpose**: Get single record by ID
- **Parameters**: `id` (number)
- **Returns**: `ParasiteControl`

##### `create(data)`
- **Purpose**: Create new record
- **Parameters**: `data` (Omit<ParasiteControl, 'serialNo'>)
- **Returns**: `ParasiteControl`

##### `update(id, data)`
- **Purpose**: Full update of record (PUT)
- **Parameters**: `id` (number), `data` (Partial<ParasiteControl>)
- **Returns**: `ParasiteControl`

##### `patch(id, data)`
- **Purpose**: Partial update of record (PATCH)
- **Parameters**: `id` (number), `data` (Partial<ParasiteControl>)
- **Returns**: `ParasiteControl`

##### `delete(id)`
- **Purpose**: Delete record
- **Parameters**: `id` (number)
- **Returns**: `void`

##### `exportToCsv(ids?)`
- **Purpose**: Export records to CSV
- **Parameters**: `ids` (optional array of record IDs)
- **Returns**: `Blob`

### 3. Service Layer (`lib/api/parasite-control-service.ts`)

The service layer provides high-level methods for common operations:

#### Utility Methods:

##### `searchByOwner(searchTerm)`
- Search records by owner name
- Returns paginated results

##### `getRecordsByHealthStatus(status)`
- Filter records by health status
- Status options: 'Healthy', 'Sick', 'Under Treatment'

##### `getRecordsByCompliance(compliance)`
- Filter records by compliance status
- Options: 'Comply', 'Not Comply'

##### `getRecordsByDateRange(startDate, endDate)`
- Filter records by date range
- Date format: YYYY-MM-DD

##### `getStatistics()`
- Get dashboard statistics
- Returns counts for health status and compliance

### 4. Error Handling

#### API Error Responses:
- **Network Errors**: Automatic fallback to mock data
- **Timeout Errors**: 15-second timeout with retry mechanism
- **Authentication Errors**: Automatic logout and redirect
- **Validation Errors**: User-friendly error messages

#### Fallback Strategy:
1. Try real API endpoint
2. If fails, log error and use mock data
3. Show user-friendly error message
4. Maintain application functionality

### 5. Testing

#### API Test Component (`components/api-test/parasite-control-test.tsx`)

The test component provides:
- **GET All Test**: Test pagination and filtering
- **GET By ID Test**: Test single record retrieval
- **CREATE Test**: Test record creation
- **Statistics Test**: Test dashboard statistics

#### Usage:
```typescript
import { ParasiteControlAPITest } from '@/components/api-test/parasite-control-test';

// Add to any page for testing
<ParasiteControlAPITest />
```

### 6. Data Structure

#### ParasiteControl Interface:
```typescript
interface ParasiteControl {
  serialNo: number;
  date: string;
  owner: Owner;
  location: Location;
  supervisor: string;
  vehicleNo: string;
  herd: Herd;
  insecticide: Insecticide;
  barns: Barn[];
  breedingSites: BreedingSite[];
  herdLocation: string;
  animalBarnSizeSqM: number;
  parasiteControlVolume: number;
  parasiteControlStatus: string;
  herdHealthStatus: "Healthy" | "Sick" | "Under Treatment";
  complying: "Comply" | "Not Comply";
  request: Request;
  category: string;
  remarks: string;
}
```

### 7. Usage Examples

#### Basic CRUD Operations:
```typescript
import { ParasiteControlService } from '@/lib/api/parasite-control-service';

// Get all records
const records = await ParasiteControlService.getAllRecords({
  page: 1,
  limit: 20,
  search: 'owner name'
});

// Create new record
const newRecord = await ParasiteControlService.createRecord({
  date: '2024-01-01',
  owner: { name: 'John Doe', id: '1234567890', ... },
  // ... other fields
});

// Update record
const updatedRecord = await ParasiteControlService.updateRecord(1, {
  herdHealthStatus: 'Healthy'
});

// Delete record
await ParasiteControlService.deleteRecord(1);
```

#### Advanced Filtering:
```typescript
// Search by owner
const ownerRecords = await ParasiteControlService.searchByOwner('John');

// Filter by health status
const healthyRecords = await ParasiteControlService.getRecordsByHealthStatus('Healthy');

// Filter by date range
const recentRecords = await ParasiteControlService.getRecordsByDateRange(
  '2024-01-01',
  '2024-01-31'
);
```

### 8. Configuration

#### Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://barns-g2ou.vercel.app/
```

#### Timeout Configuration:
- **Regular Requests**: 15 seconds
- **Export Requests**: 30 seconds
- **Base Timeout**: 30 seconds

### 9. Best Practices

1. **Always handle errors gracefully**
2. **Use the service layer for business logic**
3. **Implement proper loading states**
4. **Cache frequently accessed data**
5. **Validate data before sending to API**
6. **Use TypeScript for type safety**

### 10. Troubleshooting

#### Common Issues:

1. **API Timeout**: Increase timeout or check network connection
2. **Authentication Errors**: Check auth token and login status
3. **Data Validation Errors**: Ensure all required fields are provided
4. **Network Errors**: Check API endpoint availability

#### Debug Steps:

1. Check browser network tab for API calls
2. Verify API endpoint is accessible
3. Check authentication token
4. Review console for error messages
5. Test with API test component

### 11. Production Considerations

1. **Remove API test component** from production builds
2. **Implement proper logging** for API errors
3. **Add monitoring** for API performance
4. **Implement retry logic** for failed requests
5. **Add rate limiting** to prevent API abuse

## Conclusion

The parasite control API integration provides a robust, type-safe, and user-friendly interface for managing parasite control records. The implementation includes comprehensive error handling, fallback mechanisms, and testing capabilities to ensure reliable operation in production environments.
