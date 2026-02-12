-- Script para mover el usuario al tenant admin y asignarle roles de administrador
DO $$
DECLARE
    v_user_id varchar(12) := 'adm950640987';
    v_admin_role_id varchar(21);
    v_user_role_id varchar(21);
    v_users_roles_id1 varchar(21);
    v_users_roles_id2 varchar(21);
BEGIN
    -- Actualizar el tenant_id del usuario de 'default' a 'admin'
    UPDATE users 
    SET tenant_id = 'admin'
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Usuario movido al tenant admin';
    
    -- Obtener los IDs de los roles de admin
    SELECT id INTO v_admin_role_id 
    FROM roles 
    WHERE tenant_id = 'admin' AND name = 'default:admin';
    
    SELECT id INTO v_user_role_id 
    FROM roles 
    WHERE tenant_id = 'admin' AND name = 'user';
    
    -- Generar IDs para las relaciones
    v_users_roles_id1 := substr(md5(random()::text), 1, 21);
    v_users_roles_id2 := substr(md5(random()::text), 1, 21);
    
    -- Asignar el rol 'default:admin'
    INSERT INTO users_roles (tenant_id, id, user_id, role_id)
    VALUES ('admin', v_users_roles_id1, v_user_id, v_admin_role_id);
    
    RAISE NOTICE 'Rol default:admin asignado';
    
    -- Asignar el rol 'user'
    INSERT INTO users_roles (tenant_id, id, user_id, role_id)
    VALUES ('admin', v_users_roles_id2, v_user_id, v_user_role_id);
    
    RAISE NOTICE 'Rol user asignado';
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Usuario admin configurado exitosamente!';
    RAISE NOTICE 'Credenciales:';
    RAISE NOTICE '  Username: newadmin';
    RAISE NOTICE '  Email: newadmin@local.dev';
    RAISE NOTICE '  Password: Admin123!';
    RAISE NOTICE '===========================================';
    
END $$;

-- Verificar la configuración
SELECT 
    u.id,
    u.tenant_id,
    u.username,
    u.primary_email,
    r.name as role_name
FROM users u
LEFT JOIN users_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'newadmin';

