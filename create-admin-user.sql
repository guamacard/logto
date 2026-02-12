-- Script para crear un nuevo usuario admin en Logto
-- Ejecutar con: psql postgresql://postgres:p0stgr3s@localhost:5432/logto -f create-admin-user.sql

-- Paso 1: Verificar el tenant_id (normalmente es 'default' para instalaciones locales)
DO $$
DECLARE
    v_tenant_id varchar(21);
    v_user_id varchar(12);
    v_role_id varchar(21);
    v_users_roles_id varchar(21);
    v_password_hash varchar(256);
BEGIN
    -- Obtener el tenant_id (usualmente 'default' para instalaciones locales)
    SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
    
    RAISE NOTICE 'Usando tenant_id: %', v_tenant_id;
    
    -- Generar IDs únicos (formato simplificado para pruebas locales)
    v_user_id := 'adm' || lpad(floor(random() * 1000000000)::text, 9, '0');
    v_users_roles_id := substr(md5(random()::text), 1, 21);
    
    -- Password hash para "Admin123!" usando Argon2i
    -- IMPORTANTE: Cambiar esta contraseña después del primer login
    v_password_hash := '$argon2i$v=19$m=4096,t=256,p=1$aUJxQTRMODg4ZkR2OEhIZQ$KMwcNXny3XbTLn2d2EISRRnqp+hKz+PHnkF+0aaLL2Y';
    
    -- Insertar el nuevo usuario
    INSERT INTO users (
        tenant_id,
        id,
        username,
        primary_email,
        password_encrypted,
        password_encryption_method,
        name,
        profile,
        identities,
        custom_data,
        logto_config,
        mfa_verifications,
        is_suspended,
        created_at,
        updated_at
    ) VALUES (
        v_tenant_id,
        v_user_id,
        'newadmin',                    -- Cambiar si lo deseas
        'newadmin@local.dev',          -- Cambiar si lo deseas
        v_password_hash,
        'Argon2i',
        'New Admin User',
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        '[]'::jsonb,
        false,
        now(),
        now()
    );
    
    RAISE NOTICE 'Usuario creado con ID: %', v_user_id;
    RAISE NOTICE 'Username: newadmin';
    RAISE NOTICE 'Email: newadmin@local.dev';
    RAISE NOTICE 'Password: Admin123!';
    
    -- Buscar el rol de admin (puede variar según la configuración)
    -- Intentar encontrar un rol de tipo 'User' que tenga permisos de admin
    SELECT id INTO v_role_id 
    FROM roles 
    WHERE tenant_id = v_tenant_id 
      AND type = 'User'
      AND is_default = true
    LIMIT 1;
    
    -- Si no hay rol por defecto, buscar cualquier rol de tipo User
    IF v_role_id IS NULL THEN
        SELECT id INTO v_role_id 
        FROM roles 
        WHERE tenant_id = v_tenant_id 
          AND type = 'User'
        LIMIT 1;
    END IF;
    
    -- Si encontramos un rol, asignarlo al usuario
    IF v_role_id IS NOT NULL THEN
        INSERT INTO users_roles (
            tenant_id,
            id,
            user_id,
            role_id
        ) VALUES (
            v_tenant_id,
            v_users_roles_id,
            v_user_id,
            v_role_id
        );
        
        RAISE NOTICE 'Rol asignado: %', v_role_id;
    ELSE
        RAISE NOTICE 'ADVERTENCIA: No se encontró ningún rol para asignar. El usuario fue creado pero sin roles.';
    END IF;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Usuario admin creado exitosamente!';
    RAISE NOTICE 'Credenciales:';
    RAISE NOTICE '  Username: newadmin';
    RAISE NOTICE '  Email: newadmin@local.dev';
    RAISE NOTICE '  Password: Admin123!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'IMPORTANTE: Cambia la contraseña después del primer login!';
    
END $$;

-- Verificar que el usuario fue creado
SELECT 
    id,
    username,
    primary_email,
    name,
    is_suspended,
    created_at
FROM users 
WHERE username = 'newadmin';

