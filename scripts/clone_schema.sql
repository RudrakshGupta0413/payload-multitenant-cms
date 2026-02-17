DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
        EXECUTE 'CREATE TABLE "' || current_setting('vars.tenant_schema') || '"."' || r.tablename || '" (LIKE public."' || r.tablename || '" INCLUDING ALL)';
    END LOOP; 
END $$;
