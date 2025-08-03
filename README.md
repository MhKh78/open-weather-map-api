You Must Have Postgres UUID extention Enabled

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

To Run Migrations Run
npm run migration:generate src/migration/{Name Of Migration}

and replace name of migration with the name you want to specify