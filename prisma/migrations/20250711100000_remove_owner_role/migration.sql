-- Convert existing owner accounts to manager before removing the enum value.
UPDATE users SET role = 'manager' WHERE role = 'owner';

-- Recreate user_role enum without owner (PostgreSQL).
ALTER TYPE user_role RENAME TO user_role_old;
CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'cashier', 'waiter', 'kitchen_staff');
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::text::user_role;
DROP TYPE user_role_old;
