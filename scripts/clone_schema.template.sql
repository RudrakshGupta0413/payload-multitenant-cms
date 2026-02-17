DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
        EXECUTE 'CREATE TABLE "{{SCHEMA}}"."' || r.tablename || '" (LIKE public."' || r.tablename || '" INCLUDING ALL)';
    END LOOP; 
END $$;
